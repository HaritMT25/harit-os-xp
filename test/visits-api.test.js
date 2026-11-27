// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'

// In-memory Redis by default; set REDIS_TEST_URL (a throwaway db, it gets
// flushed) to run the same tests against a real server.
vi.mock('ioredis', async (importOriginal) => {
  if (process.env.REDIS_TEST_URL) return importOriginal()
  const { default: RedisMock } = await import('ioredis-mock')
  return { default: RedisMock }
})

const URL = process.env.REDIS_TEST_URL || 'redis://localhost:6379'
process.env.REDIS_URL = URL

const { default: Redis } = await import('ioredis')
const admin = new Redis(URL)

const BOSTON = { city: 'Boston', cc: 'US', lat: 42.36, lon: -71.06 }
const PARIS = { city: 'Paris', cc: 'FR', lat: 48.86, lon: 2.35 }

// a fresh module = a cold serverless instance (no cached "already migrated")
async function freshHandler() {
  vi.resetModules()
  return (await import('../api/visits.js')).default
}

const BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function call(handler, { method = 'GET', body, ip = '10.0.0.1', geo, ua = BROWSER } = {}) {
  const headers = { 'x-forwarded-for': ip, 'user-agent': ua }
  if (geo) {
    headers['x-vercel-ip-city'] = encodeURIComponent(geo.city)
    headers['x-vercel-ip-country'] = geo.cc
    headers['x-vercel-ip-latitude'] = String(geo.lat)
    headers['x-vercel-ip-longitude'] = String(geo.lon)
  }
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      setHeader() {},
      status(c) { this.statusCode = c; return this },
      json(b) { resolve({ status: this.statusCode, body: b }) },
      end() { resolve({ status: this.statusCode }) },
    }
    Promise.resolve(handler({ method, headers, body }, res)).catch(reject)
  })
}

// visits in the shape the pre-pin code wrote them (no agg flag)
function legacy(name, lat, lon, city = 'Somewhere', ts = 1) {
  return JSON.stringify({ name, city, country: 'Land', lat, lon, flag: '🏳️', type: name === 'Anonymous' ? 'auto' : 'named', ts })
}

// lpush puts the newest first, like the real log
async function seedLog(visits, count) {
  if (visits.length) await admin.rpush('harit:visits', ...visits)
  await admin.set('harit:visit_count', String(count ?? visits.length))
}

const pinAt = (pins, lat, lon) => pins.find(p => p.lat === lat && p.lon === lon)
const sum = pins => pins.reduce((n, p) => n + p.count, 0)

beforeEach(async () => { await admin.flushdb() })
afterAll(async () => { await admin.flushdb(); admin.disconnect() })

describe('GET /api/visits', () => {
  it('returns every stored location, not just the newest 200', async () => {
    const visits = []
    for (let i = 0; i < 600; i++) visits.push(legacy('Anonymous', (i % 100) * 0.5 - 25, Math.floor(i / 100) * 10 - 55))
    await seedLog(visits, 1450)

    const { body } = await call(await freshHandler())
    expect(body.degraded).toBe(false)
    expect(body.pins).toHaveLength(600)
    expect(sum(body.pins)).toBe(600)
    expect(body.total).toBe(1450)
    expect(body.visits).toHaveLength(10)
  })

  it('groups repeat visits from one place, keeps the latest name, drops no-location visits', async () => {
    // newest first
    await seedLog([
      legacy('Bo', 42.4, -71.1, 'Boston', 5),
      legacy('Anonymous', 48.9, 2.4, 'Paris', 4),
      legacy('Ana', 42.4, -71.1, 'Boston', 3),
      legacy('Anonymous', 0, 0, 'Unknown', 2),
      legacy('Anonymous', 42.4, -71.1, 'Boston', 1),
    ])
    const { body } = await call(await freshHandler())
    expect(body.pins).toHaveLength(2)
    expect(pinAt(body.pins, 42.4, -71.1)).toMatchObject({ count: 3, name: 'Bo', hasNamed: true, city: 'Boston' })
    expect(pinAt(body.pins, 48.9, 2.4)).toMatchObject({ count: 1, name: 'Anonymous', hasNamed: false })
    expect(body.total).toBe(5)
  })

  it('folds the old log in exactly once, across warm and cold instances', async () => {
    await seedLog([legacy('Anonymous', 42.4, -71.1), legacy('Anonymous', 42.4, -71.1)])
    const h = await freshHandler()
    await call(h)
    await call(h)
    const { body } = await call(await freshHandler())
    expect(pinAt(body.pins, 42.4, -71.1).count).toBe(2)
  })

  it('migrates once when the first requests arrive together', async () => {
    await seedLog(Array.from({ length: 50 }, () => legacy('Anonymous', 42.4, -71.1)))
    const handlers = []
    for (let i = 0; i < 5; i++) handlers.push(await freshHandler())
    const results = await Promise.all(handlers.map(h => call(h)))
    for (const { body } of results) expect(pinAt(body.pins, 42.4, -71.1).count).toBe(50)
    expect(await admin.hget('harit:pins:count', '42.4,-71.1')).toBe('50')
  })

  it('hides the internal agg flag from the recent strip', async () => {
    const h = await freshHandler()
    await call(h, { method: 'POST', body: { name: 'Anonymous', type: 'auto' }, geo: BOSTON })
    const { body } = await call(h)
    expect(body.visits[0]).toMatchObject({ city: 'Boston', name: 'Anonymous' })
    expect(body.visits[0]).not.toHaveProperty('agg')
  })
})

describe('POST /api/visits', () => {
  it('keeps counting a place after the 1000-entry log has trimmed its visits', async () => {
    await seedLog(Array.from({ length: 1000 }, () => legacy('Anonymous', 48.9, 2.4)))
    const h = await freshHandler()
    await call(h)
    for (let i = 0; i < 5; i++) {
      const r = await call(h, { method: 'POST', body: { type: 'auto' }, ip: `10.0.1.${i}`, geo: BOSTON })
      expect(r.body.ok).toBe(true)
    }
    expect(await admin.llen('harit:visits')).toBe(1000)

    const { body } = await call(await freshHandler())
    expect(pinAt(body.pins, 48.9, 2.4).count).toBe(1000)
    expect(pinAt(body.pins, 42.4, -71.1).count).toBe(5)
    expect(body.total).toBe(1005)
  })

  it('folds the old log in before its first push can trim anything', async () => {
    await seedLog(Array.from({ length: 1000 }, () => legacy('Anonymous', 48.9, 2.4)))
    await call(await freshHandler(), { method: 'POST', body: { type: 'auto' }, geo: BOSTON })
    const { body } = await call(await freshHandler())
    expect(pinAt(body.pins, 48.9, 2.4).count).toBe(1000)
    expect(pinAt(body.pins, 42.4, -71.1).count).toBe(1)
  })

  it('turns the pin gold when someone signs, with markup stripped', async () => {
    const h = await freshHandler()
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: PARIS })
    await call(h, { method: 'POST', body: { name: '<i>Zed', type: 'named' }, geo: PARIS })
    const { body } = await call(h)
    expect(pinAt(body.pins, 48.9, 2.4)).toMatchObject({ count: 2, name: 'iZed', hasNamed: true, city: 'Paris', flag: '🇫🇷' })
  })

  it('counts a visit with no location in the total but gives it no pin', async () => {
    const h = await freshHandler()
    await call(h, { method: 'POST', body: { type: 'auto' } })
    const { body } = await call(h)
    expect(body.total).toBe(1)
    expect(body.pins).toHaveLength(0)
  })

  it('rate-limits a fourth post from the same IP and does not count it', async () => {
    const h = await freshHandler()
    const codes = []
    for (let i = 0; i < 4; i++) codes.push((await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON })).status)
    expect(codes).toEqual([200, 200, 200, 429])
    const { body } = await call(h)
    expect(pinAt(body.pins, 42.4, -71.1).count).toBe(3)
    expect(body.total).toBe(3)
  })
})

describe('POST /api/visits bot filter', () => {
  it('does not count crawlers or clients with no user agent', async () => {
    const h = await freshHandler()
    for (const ua of ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0)', '']) {
      const r = await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON, ua })
      expect(r.body).toMatchObject({ ok: true, skipped: 'bot' })
    }
    const { body } = await call(h)
    expect(body.total).toBe(0)
    expect(body.pins).toHaveLength(0)
  })
})

describe('owner key', () => {
  const owner = (h, body, opts = {}) => call(h, { method: 'POST', body: { type: 'owner', ...body }, geo: BOSTON, ...opts })

  beforeEach(() => { process.env.OWNER_KEY = 'right-key' })
  afterAll(() => { delete process.env.OWNER_KEY })

  it('says so when no key is configured', async () => {
    delete process.env.OWNER_KEY
    const r = await owner(await freshHandler(), { key: 'anything' })
    expect(r).toMatchObject({ status: 503, body: { ok: false, error: 'unset' } })
  })

  it('rejects a wrong key and locks the IP after five misses, even for the right key', async () => {
    const h = await freshHandler()
    for (let i = 0; i < 5; i++) expect((await owner(h, { key: 'guess' + i })).status).toBe(401)
    expect(await owner(h, { key: 'right-key' })).toMatchObject({ status: 429, body: { error: 'locked' } })
    // another IP is unaffected
    expect((await owner(h, { key: 'right-key' }, { ip: '10.9.9.9' })).status).toBe(200)
  })

  it('unlocks without touching counts unless asked to discount', async () => {
    const h = await freshHandler()
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON })
    expect(await owner(h, { key: 'right-key' })).toMatchObject({ status: 200, body: { ok: true, discounted: false } })
    const { body } = await call(h)
    expect(body.total).toBe(1)
  })

  it('takes back the remembered visit, removing the pin when it was the only one', async () => {
    const h = await freshHandler()
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: PARIS, ip: '10.0.0.2' })
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON, ip: '10.0.0.3' })
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON, ip: '10.0.0.4' })
    // the owner's browser was counted in Paris but unlocks from Boston
    const r = await owner(h, { key: 'right-key', discount: true, cell: '48.9,2.4' })
    expect(r.body).toEqual({ ok: true, discounted: true })
    const { body } = await call(h)
    expect(body.total).toBe(2)
    expect(pinAt(body.pins, 48.9, 2.4)).toBeUndefined()
    expect(pinAt(body.pins, 42.4, -71.1).count).toBe(2)
  })

  it('falls back to the request location when no cell was remembered, and ignores junk cells', async () => {
    const h = await freshHandler()
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON, ip: '10.0.0.3' })
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON, ip: '10.0.0.4' })
    const r = await owner(h, { key: 'right-key', discount: true, cell: 'x,<script>' })
    expect(r.body.discounted).toBe(true)
    const { body } = await call(h)
    expect(body.total).toBe(1)
    expect(pinAt(body.pins, 42.4, -71.1).count).toBe(1)
  })

  it('does not discount a place with no pin', async () => {
    const h = await freshHandler()
    await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON })
    const r = await owner(h, { key: 'right-key', discount: true, cell: '10,10' })
    expect(r.body.discounted).toBe(false)
    expect((await call(h)).body.total).toBe(1)
  })

  it('does not use up the visit rate limit', async () => {
    const h = await freshHandler()
    for (let i = 0; i < 4; i++) await owner(h, { key: 'right-key' })
    expect((await call(h, { method: 'POST', body: { type: 'auto' }, geo: BOSTON })).status).toBe(200)
  })
})
