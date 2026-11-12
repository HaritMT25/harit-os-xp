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

// Keys. The list is the raw visit log: the map's "Recent" strip reads it, and
// ltrim caps it at 1000. The pin hashes hold one field per ~11 km cell and
// never get trimmed, so the map shows every place anyone has visited from.
const VISITS = 'harit:visits'
const VISIT_COUNT = 'harit:visit_count'
const PIN_COUNT = 'harit:pins:count' // cell -> visits from that cell
const PIN_META = 'harit:pins:meta' // cell -> {lat, lon, city, country, flag}
const PIN_NAME = 'harit:pins:name' // cell -> latest name signed there
const MIGRATED = 'harit:pins:migrated' // set once the old list is folded in
const MIGRATE_LOCK = 'harit:pins:migrate_lock'
const LOG_KEEP = 1000
const RECENT = 10

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

// x-vercel-ip-country is a 2-letter code; ipapi.co used to hand back a full name
function countryName(code) {
  if (!code || code.length !== 2) return 'Unknown'
  try { return regionNames.of(code.toUpperCase()) || code } catch { return code }
}

function flagFromCode(code) {
  if (!code || code.length !== 2) return '🌍'
  return code.toUpperCase().split('').map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('')
}

function round(n) { return Math.round((Number(n) || 0) * 10) / 10 }

// names are visitor-submitted and rendered on everyone's map — strip markup
// at the write boundary so a bad record can never enter the list
function cleanName(v) {
  return String(v ?? '').replace(/[<>&"'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24)
}

// 0.1° grid, the same rounding the visit itself is stored with. Visits with
// no location (0,0) count toward the total but get no pin.
function cellOf(v) {
  const lat = round(v.lat)
  const lon = round(v.lon)
  if (!lat && !lon) return null
  return `${lat},${lon}`
}

function metaOf(v) {
  return JSON.stringify({
    lat: round(v.lat), lon: round(v.lon),
    city: v.city || 'Unknown', country: v.country || 'Unknown', flag: v.flag || '🌍',
  })
}

function isNamed(v) { return v.name && v.name !== 'Anonymous' }

// one pin per IP per day; without this a script could flood the log and the
// pin counts
const POST_LIMIT = 3
const POST_WINDOW = 24 * 60 * 60

async function underPostLimit(redis, req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown'
  const key = `harit:visit_rl:${ip}`
  const n = await redis.incr(key)
  if (n === 1) await redis.expire(key, POST_WINDOW)
  return n <= POST_LIMIT
}

// Vercel populates these on every function invocation, all plans. Absent locally.
function geoFromHeaders(req) {
  const h = req.headers
  const city = h['x-vercel-ip-city'] ? decodeURIComponent(h['x-vercel-ip-city']) : ''
  const code = h['x-vercel-ip-country'] || ''
  const lat = round(h['x-vercel-ip-latitude'])
  const lon = round(h['x-vercel-ip-longitude'])
  if (!lat && !lon) return null
  return { city: city || 'Unknown', country: countryName(code), lat, lon, flag: flagFromCode(code) }
}

// The map used to read only the newest 200 log entries. Visits written since
// the pin hashes exist carry agg:1 (already counted); this folds every older
// entry still in the log into the hashes, once, in one transaction.
let migratedHere = false // per warm instance, saves an EXISTS per request

async function ensureMigrated(redis) {
  if (migratedHere) return
  if (await redis.exists(MIGRATED)) { migratedHere = true; return }

  const locked = await redis.set(MIGRATE_LOCK, '1', 'EX', 30, 'NX')
  if (!locked) {
    // another request is migrating; give it a moment rather than serve an empty map
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 100))
      if (await redis.exists(MIGRATED)) { migratedHere = true; return }
    }
    return
  }

  try {
    if (await redis.exists(MIGRATED)) { migratedHere = true; return }
    const raw = await redis.lrange(VISITS, 0, -1)
    const cells = new Map()
    // the log is newest-first; walk oldest-first so later names and labels win
    for (let i = raw.length - 1; i >= 0; i--) {
      let v
      try { v = JSON.parse(raw[i]) } catch { continue }
      if (!v || v.agg) continue
      const cell = cellOf(v)
      if (!cell) continue
      const c = cells.get(cell) || { count: 0, meta: null, name: null }
      c.count++
      c.meta = metaOf(v)
      if (isNamed(v)) c.name = cleanName(v.name)
      cells.set(cell, c)
    }
    const tx = redis.multi()
    for (const [cell, c] of cells) {
      tx.hincrby(PIN_COUNT, cell, c.count)
      // NX: a visit written by the new code since deploy is newer, keep its label
      tx.hsetnx(PIN_META, cell, c.meta)
      if (c.name) tx.hsetnx(PIN_NAME, cell, c.name)
    }
    tx.set(MIGRATED, String(Date.now()))
    const res = await tx.exec()
    const failed = res && res.find(([err]) => err)
    if (failed) throw failed[0]
    migratedHere = true
  } finally {
    await redis.del(MIGRATE_LOCK)
  }
}

async function readPins(redis) {
  const [[e1, counts], [e2, metas], [e3, names]] = await redis.pipeline()
    .hgetall(PIN_COUNT).hgetall(PIN_META).hgetall(PIN_NAME).exec()
  if (e1 || e2 || e3) throw e1 || e2 || e3
  const pins = []
  for (const cell of Object.keys(counts || {})) {
    let meta
    try { meta = JSON.parse(metas[cell]) } catch { continue }
    const count = parseInt(counts[cell]) || 0
    if (!meta || count < 1) continue
    const name = names?.[cell]
    pins.push({ ...meta, count, name: name || 'Anonymous', hasNamed: !!name })
  }
  return pins
}

function publicVisit(v) {
  const { agg, ...rest } = v
  return rest
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
      // before the push: ltrim must never drop an entry that isn't counted yet
      await ensureMigrated(redis)
      if (!(await underPostLimit(redis, req))) {
        redis.disconnect()
        return res.status(429).json({ ok: false, error: 'rate_limited' })
      }
      const body = req.body || {}
      const visit = {
        name: cleanName(body.name) || 'Anonymous',
        city: you?.city || body.city || 'Unknown',
        country: you?.country || body.country || 'Unknown',
        lat: you?.lat ?? round(body.lat),
        lon: you?.lon ?? round(body.lon),
        flag: you?.flag || body.flag || '🌍',
        type: body.type === 'named' ? 'named' : 'auto',
        ts: Date.now(),
      }
      const tx = redis.multi()
        .lpush(VISITS, JSON.stringify({ ...visit, agg: 1 }))
        .ltrim(VISITS, 0, LOG_KEEP - 1)
        .incr(VISIT_COUNT)
      const cell = cellOf(visit)
      if (cell) {
        tx.hincrby(PIN_COUNT, cell, 1).hset(PIN_META, cell, metaOf(visit))
        if (isNamed(visit)) tx.hset(PIN_NAME, cell, visit.name)
      }
      await tx.exec()
      redis.disconnect()
      return res.status(200).json({ ok: true, visit })
    }

    if (req.method === 'GET') {
      await ensureMigrated(redis)
      const pins = await readPins(redis)
      const raw = await redis.lrange(VISITS, 0, RECENT - 1)
      const count = await redis.get(VISIT_COUNT)
      redis.disconnect()
      const visits = raw.map(v => { try { return publicVisit(JSON.parse(v)) } catch { return null } }).filter(Boolean)
      const pinned = pins.reduce((n, p) => n + p.count, 0)
      return res.status(200).json({
        pins, visits, total: parseInt(count) || pinned, you, degraded: false,
      })
    }

    redis.disconnect()
    return res.status(405).end()
  } catch (err) {
    if (redis) { try { redis.disconnect() } catch {} }
    console.error('visits: redis unavailable —', err?.message || err)
    // Map still renders with the visitor's own pin; pins just don't persist.
    if (req.method === 'GET') return res.status(200).json({ pins: [], visits: [], total: 0, you, degraded: true })
    return res.status(200).json({ ok: false, degraded: true })
  }
}
