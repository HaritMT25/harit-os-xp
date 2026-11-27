import Redis from 'ioredis'
import { createHash, randomBytes } from 'node:crypto'
import { checkOwner, clientIp, isBot, OWNER_STATUS } from '../server/owner.js'

// View counts and comments for the static blog under /blog.
//
//   GET  ?slug=s                      -> { views, comments }   (visible comments only)
//   GET  ?views=all                   -> { views: { slug: n } }
//   POST { action: 'view', slug }     -> { views }  one per visitor per post per day
//   POST { action: 'comment', slug, name, text, website, key? }
//   POST { action: 'mod', key, op: 'list' | 'approve' | 'hide' | 'delete', ref? }
//
// Comments show at once unless they look like spam (links) or claim the
// owner's name; those wait for approval on /blog/moderate/. Raw IPs are never
// stored: rate-limit and dedupe keys use a salted hash that expires.

function getRedis() {
  const url = (process.env.REDIS_URL || 'redis://localhost:6379').trim()
  return new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    lazyConnect: true,
    tls: url.startsWith('rediss://') ? {} : undefined,
  })
}

const VIEWS = 'blog:views' // hash slug -> views
const SEEN = 'blog:seen:' // + visitor hash, one key per visitor/post/day
const COMMENTS = 'blog:c:' // + slug: hash id -> comment JSON
const RECENT = 'blog:c:recent' // zset "slug/id" scored by time, for moderation
const PENDING = 'blog:c:pending' // set of "slug/id" waiting for approval
const RATE = 'blog:rl:' // + window + visitor hash

const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/
const NAME_MAX = 40
const TEXT_MAX = 2000
const PENDING_CAP = 300 // stop queueing when nobody has moderated for a while
const MOD_LIST = 200
const DAY = 24 * 60 * 60

const LINKY = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|info|biz|top|shop|site|online)\b)/i
const OWNER_NAME = /harit/i

function visitorHash(req, salt) {
  return createHash('sha256').update(`${clientIp(req)}|${req.headers['user-agent'] || ''}|${salt}`).digest('hex').slice(0, 32)
}

const today = () => new Date().toISOString().slice(0, 10)

function cleanName(v) {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX)
}

function cleanText(v) {
  return String(v ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, TEXT_MAX)
}

function publicComment(c) {
  return { id: c.id, name: c.name, text: c.text, ts: c.ts, owner: !!c.owner }
}

async function underLimit(redis, key, limit, window) {
  const n = await redis.incr(key)
  if (n === 1) await redis.expire(key, window)
  return n <= limit
}

async function readComments(redis, slug) {
  const all = await redis.hvals(COMMENTS + slug)
  return all
    .map(s => { try { return JSON.parse(s) } catch { return null } })
    .filter(Boolean)
    .sort((a, b) => a.ts - b.ts)
}

async function countView(redis, req, slug) {
  // the slug isn't checked against real posts, so cap how many one visitor can mint
  if (isBot(req) || !(await underLimit(redis, `${RATE}views:${visitorHash(req, 'views')}`, 100, DAY))) {
    return parseInt(await redis.hget(VIEWS, slug)) || 0
  }
  const fresh = await redis.set(SEEN + visitorHash(req, `${slug}|${today()}`), '1', 'EX', DAY + 3600, 'NX')
  if (fresh) return redis.hincrby(VIEWS, slug, 1)
  return parseInt(await redis.hget(VIEWS, slug)) || 0
}

async function addComment(redis, req, body, slug) {
  // honeypot: a field people never see. Bots fill it; pretend it worked.
  if (body.website) return { code: 200, body: { ok: true, status: 'pending' } }

  const text = cleanText(body.text)
  if (text.length < 2) return { code: 400, body: { ok: false, error: 'empty' } }

  let owner = false
  if (body.key) {
    const status = await checkOwner(redis, req, body.key)
    if (status !== 'ok') return { code: OWNER_STATUS[status], body: { ok: false, error: status } }
    owner = true
  }

  if (!owner) {
    if (isBot(req)) return { code: 200, body: { ok: true, status: 'pending' } }
    const who = visitorHash(req, 'comment')
    if (!(await underLimit(redis, `${RATE}10m:${who}`, 3, 600))
      || !(await underLimit(redis, `${RATE}day:${who}`, 20, DAY))) {
      return { code: 429, body: { ok: false, error: 'rate_limited' } }
    }
  }

  const name = cleanName(body.name) || 'Anonymous'
  const held = !owner && (LINKY.test(text) || LINKY.test(name) || OWNER_NAME.test(name))
  if (held && (await redis.scard(PENDING)) >= PENDING_CAP) {
    return { code: 503, body: { ok: false, error: 'busy' } }
  }

  const c = {
    id: Date.now().toString(36) + randomBytes(3).toString('hex'),
    name, text, ts: Date.now(),
    status: held ? 'pending' : 'visible',
    ...(owner ? { owner: true } : {}),
  }
  const ref = `${slug}/${c.id}`
  const tx = redis.multi().hset(COMMENTS + slug, c.id, JSON.stringify(c)).zadd(RECENT, c.ts, ref)
  if (held) tx.sadd(PENDING, ref)
  await tx.exec()
  return { code: 200, body: { ok: true, status: c.status, comment: held ? null : publicComment(c) } }
}

function parseRef(ref) {
  const m = /^([a-z0-9][a-z0-9-]{0,79})\/([a-z0-9]{1,32})$/.exec(String(ref ?? ''))
  return m ? { slug: m[1], id: m[2] } : null
}

async function moderate(redis, req, body) {
  const status = await checkOwner(redis, req, body.key)
  if (status !== 'ok') return { code: OWNER_STATUS[status], body: { ok: false, error: status } }

  if (body.op === 'list') {
    const refs = (await redis.zrevrange(RECENT, 0, MOD_LIST - 1)).map(ref => ({ ref, r: parseRef(ref) })).filter(x => x.r)
    const pipe = redis.pipeline()
    refs.forEach(({ r }) => pipe.hget(COMMENTS + r.slug, r.id))
    const raws = refs.length ? await pipe.exec() : []
    const comments = []
    refs.forEach(({ ref, r }, i) => {
      const raw = raws[i]?.[1]
      if (!raw) return
      try { comments.push({ ...JSON.parse(raw), slug: r.slug, ref }) } catch {}
    })
    return { code: 200, body: { ok: true, comments, pending: await redis.scard(PENDING) } }
  }

  const r = parseRef(body.ref)
  if (!r || !['approve', 'hide', 'delete'].includes(body.op)) return { code: 400, body: { ok: false, error: 'bad_request' } }
  const ref = `${r.slug}/${r.id}`
  const raw = await redis.hget(COMMENTS + r.slug, r.id)
  if (!raw) return { code: 404, body: { ok: false, error: 'not_found' } }

  if (body.op === 'delete') {
    await redis.multi().hdel(COMMENTS + r.slug, r.id).zrem(RECENT, ref).srem(PENDING, ref).exec()
    return { code: 200, body: { ok: true } }
  }
  const c = JSON.parse(raw)
  c.status = body.op === 'approve' ? 'visible' : 'hidden'
  await redis.multi().hset(COMMENTS + r.slug, r.id, JSON.stringify(c)).srem(PENDING, ref).exec()
  return { code: 200, body: { ok: true, comment: { ...c, slug: r.slug, ref } } }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const body = req.body || {}
  const query = req.query || {}
  const slug = String((req.method === 'GET' ? query.slug : body.slug) ?? '')

  let redis
  try {
    redis = getRedis()
    await redis.connect()
    let out

    if (req.method === 'GET') {
      if (query.views === 'all') {
        const all = await redis.hgetall(VIEWS)
        const views = {}
        for (const [k, v] of Object.entries(all || {})) views[k] = parseInt(v) || 0
        out = { code: 200, body: { views } }
      } else if (SLUG.test(slug)) {
        const [views, comments] = await Promise.all([redis.hget(VIEWS, slug), readComments(redis, slug)])
        out = { code: 200, body: { views: parseInt(views) || 0, comments: comments.filter(c => c.status === 'visible').map(publicComment) } }
      } else {
        out = { code: 400, body: { ok: false, error: 'bad_slug' } }
      }
    } else if (req.method === 'POST') {
      if (body.action === 'mod') out = await moderate(redis, req, body)
      else if (!SLUG.test(slug)) out = { code: 400, body: { ok: false, error: 'bad_slug' } }
      else if (body.action === 'view') out = { code: 200, body: { views: await countView(redis, req, slug) } }
      else if (body.action === 'comment') out = await addComment(redis, req, body, slug)
      else out = { code: 400, body: { ok: false, error: 'bad_request' } }
    } else {
      out = { code: 405, body: { ok: false } }
    }

    redis.disconnect()
    return res.status(out.code).json(out.body)
  } catch (err) {
    if (redis) { try { redis.disconnect() } catch {} }
    console.error('blog: redis unavailable —', err?.message || err)
    return res.status(503).json({ ok: false, error: 'unavailable' })
  }
}
