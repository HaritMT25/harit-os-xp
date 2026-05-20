import Redis from 'ioredis'

// works with local docker redis (redis://localhost:6379)
// and upstash/vercel redis in production (redis://...upstash.io:6379)
function getRedis() {
  return new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    lazyConnect: true,
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  let redis
  try {
    redis = getRedis()
    await redis.connect()

    if (req.method === 'POST') {
      const { name, city, country, lat, lon, flag } = req.body || {}
      const visit = {
        name: (name || '').trim() || 'Anonymous',
        city: city || 'Unknown',
        country: country || 'Unknown',
        lat: parseFloat(lat) || 0,
        lon: parseFloat(lon) || 0,
        flag: flag || '🌍',
        ts: Date.now(),
      }
      await redis.lpush('harit:visits', JSON.stringify(visit))
      await redis.ltrim('harit:visits', 0, 999)
      await redis.incr('harit:visit_count')
      redis.disconnect()
      return res.json({ ok: true, visit })
    }

    if (req.method === 'GET') {
      const raw = await redis.lrange('harit:visits', 0, 199)
      const count = await redis.get('harit:visit_count')
      redis.disconnect()
      return res.json({
        visits: raw.map(v => JSON.parse(v)),
        total: parseInt(count) || raw.length,
      })
    }

    redis.disconnect()
    return res.status(405).end()
  } catch (err) {
    if (redis) redis.disconnect().catch(() => {})
    // redis not available — degrade gracefully
    if (req.method === 'GET') return res.json({ visits: [], total: 0 })
    return res.json({ ok: false })
  }
}
