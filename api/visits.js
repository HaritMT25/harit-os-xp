import Redis from 'ioredis'

// local: redis://localhost:6379
// upstash: rediss://default:pass@host.upstash.io:6379 (tls)
function getRedis() {
  const url = (process.env.REDIS_URL || 'redis://localhost:6379').trim()
  return new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    lazyConnect: true,
    tls: url.startsWith('rediss://') ? {} : undefined,
  })
}

function flagFromCode(code) {
  if (!code || code.length !== 2) return '🌍'
  return code.toUpperCase().split('').map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('')
}

function round(n) { return Math.round((Number(n) || 0) * 10) / 10 }

// Vercel populates these on every function invocation, all plans. Absent locally.
function geoFromHeaders(req) {
  const h = req.headers
  const city = h['x-vercel-ip-city'] ? decodeURIComponent(h['x-vercel-ip-city']) : ''
  const code = h['x-vercel-ip-country'] || ''
  const lat = round(h['x-vercel-ip-latitude'])
  const lon = round(h['x-vercel-ip-longitude'])
  if (!lat && !lon) return null
  return { city: city || 'Unknown', country: code || 'Unknown', lat, lon, flag: flagFromCode(code) }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const you = geoFromHeaders(req)
  let redis

  try {
    redis = getRedis()
    await redis.connect()

    if (req.method === 'POST') {
      const body = req.body || {}
      const visit = {
        name: String(body.name || '').trim().slice(0, 40) || 'Anonymous',
        city: you?.city || body.city || 'Unknown',
        country: you?.country || body.country || 'Unknown',
        lat: you?.lat ?? round(body.lat),
        lon: you?.lon ?? round(body.lon),
        flag: you?.flag || body.flag || '🌍',
        type: body.type === 'named' ? 'named' : 'auto',
        ts: Date.now(),
      }
      await redis.lpush('harit:visits', JSON.stringify(visit))
      await redis.ltrim('harit:visits', 0, 999)
      await redis.incr('harit:visit_count')
      redis.disconnect()
      return res.status(200).json({ ok: true, visit })
    }

    if (req.method === 'GET') {
      const raw = await redis.lrange('harit:visits', 0, 199)
      const count = await redis.get('harit:visit_count')
      redis.disconnect()
      const visits = raw.map(v => { try { return JSON.parse(v) } catch { return null } }).filter(Boolean)
      return res.status(200).json({ visits, total: parseInt(count) || visits.length, you, degraded: false })
    }

    redis.disconnect()
    return res.status(405).end()
  } catch (err) {
    if (redis) { try { redis.disconnect() } catch {} }
    console.error('visits: redis unavailable —', err?.message || err)
    // Map still renders with the visitor's own pin; pins just don't persist.
    if (req.method === 'GET') return res.status(200).json({ visits: [], total: 0, you, degraded: true })
    return res.status(200).json({ ok: false, degraded: true })
  }
}
