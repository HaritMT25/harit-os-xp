import { createHash, timingSafeEqual } from 'node:crypto'

// The owner key (Vercel env OWNER_KEY) unlocks owner-only actions: leaving
// the owner's own visits out of the counts, and moderating blog comments.
// Wrong guesses are capped per IP so the key can't be brute-forced through
// the API. Lives outside api/ because Vercel deploys every file there as a
// function.
const FAIL_LIMIT = 5
const FAIL_WINDOW = 60 * 60

export function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown'
}

function digest(s) { return createHash('sha256').update(String(s ?? '')).digest() }

function configuredKey() { return (process.env.OWNER_KEY || '').trim() }

// 'ok' | 'bad' | 'locked' | 'unset'
export async function checkOwner(redis, req, given) {
  const want = configuredKey()
  if (!want) return 'unset'
  const failKey = `harit:owner_fail:${clientIp(req)}`
  if ((parseInt(await redis.get(failKey)) || 0) >= FAIL_LIMIT) return 'locked'
  if (given && timingSafeEqual(digest(String(given).trim()), digest(want))) return 'ok'
  const n = await redis.incr(failKey)
  if (n === 1) await redis.expire(failKey, FAIL_WINDOW)
  return 'bad'
}

export const OWNER_STATUS = { ok: 200, bad: 401, locked: 429, unset: 503 }

// Crawlers that run JavaScript (Googlebot, link previewers, headless
// screenshotters) would otherwise land on the map as visitors.
const BOT_UA = /bot\b|bot\/|crawler|spider|slurp|headless|lighthouse|inspectiontool|googleother|facebookexternalhit|embedly|preview|python-|curl\/|wget\//i

export function isBot(req) {
  const ua = req.headers['user-agent'] || ''
  return !ua || BOT_UA.test(ua)
}
