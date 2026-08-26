import Redis from 'ioredis'
import { SYSTEM_PROMPT, GROQ_MODEL, GROQ_URL } from '../src/data/haritbot-prompt.js'

// HaritBot proxy — keeps the Groq key server-side and owns the system
// prompt, so the endpoint can't be repurposed as a free LLM API.
// GET  -> { configured } health check for the client's online/offline dot
// POST -> { reply } for a [{ role, content }] history (user/assistant only)

const RATE_LIMIT = 30            // requests per IP
const RATE_WINDOW = 60 * 60      // per hour

// GROQ_API_KEY is preferred; VITE_GROQ_API_KEY is accepted so existing
// Vercel env config keeps working (the client no longer bundles it)
const apiKey = () => process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || ''

function getRedis() {
  const url = (process.env.REDIS_URL || 'redis://localhost:6379').trim()
  return new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    lazyConnect: true,
    tls: url.startsWith('rediss://') ? {} : undefined,
  })
}

// fail-open: no Redis just means no rate limiting
async function underRateLimit(ip) {
  let redis
  try {
    redis = getRedis()
    await redis.connect()
    const key = `harit:chat_rl:${ip}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, RATE_WINDOW)
    redis.disconnect()
    return count <= RATE_LIMIT
  } catch {
    if (redis) redis.disconnect()
    return true
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ configured: !!apiKey() })
  }
  if (req.method !== 'POST') return res.status(405).end()

  const key = apiKey()
  if (!key) return res.status(503).json({ error: 'not_configured' })

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown'
  if (!(await underRateLimit(ip))) {
    return res.status(429).json({ error: 'rate_limited' })
  }

  const { messages } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'bad_request' })
  }
  // forward only role/content, drop client-sent system prompts, cap sizes
  const history = messages.slice(-20).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content || '').slice(0, 4000),
  }))

  try {
    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        temperature: 0.7,
        max_completion_tokens: 1024,
        reasoning_effort: 'low',
        include_reasoning: false,
      }),
    })
    if (!upstream.ok) {
      const detail = await upstream.json().catch(() => null)
      console.error('groq', upstream.status, detail?.error?.message || '')
      return res.status(502).json({ error: 'upstream', status: upstream.status, detail: detail?.error?.message })
    }
    const data = await upstream.json()
    return res.json({ reply: data.choices?.[0]?.message?.content || '' })
  } catch {
    return res.status(502).json({ error: 'upstream' })
  }
}
