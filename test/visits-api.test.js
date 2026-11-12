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

function call(handler, { method = 'GET', body, ip = '10.0.0.1', geo } = {}) {
  const headers = { 'x-forwarded-for': ip }
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
