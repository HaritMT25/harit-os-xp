// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'

// Same setup as visits-api.test.js: in-memory Redis unless REDIS_TEST_URL
// names a throwaway server (it gets flushed).
vi.mock('ioredis', async (importOriginal) => {
  if (process.env.REDIS_TEST_URL) return importOriginal()
  const { default: RedisMock } = await import('ioredis-mock')
  return { default: RedisMock }
})

const URL = process.env.REDIS_TEST_URL || 'redis://localhost:6379'
process.env.REDIS_URL = URL

const { default: Redis } = await import('ioredis')
const admin = new Redis(URL)
const { default: handler } = await import('../api/blog.js')

const BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function call({ method = 'GET', body, query = {}, ip = '10.0.0.1', ua = BROWSER } = {}) {
  const headers = { 'x-forwarded-for': ip, 'user-agent': ua }
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      setHeader() {},
      status(c) { this.statusCode = c; return this },
      json(b) { resolve({ status: this.statusCode, body: b }) },
      end() { resolve({ status: this.statusCode }) },
    }
    Promise.resolve(handler({ method, headers, body, query }, res)).catch(reject)
  })
}

const view = (slug, opts) => call({ method: 'POST', body: { action: 'view', slug }, ...opts })
const comment = (slug, fields, opts) => call({ method: 'POST', body: { action: 'comment', slug, ...fields }, ...opts })
const mod = (fields, opts) => call({ method: 'POST', body: { action: 'mod', key: 'right-key', ...fields }, ...opts })
const read = slug => call({ query: { slug } }).then(r => r.body)

beforeEach(async () => { await admin.flushdb(); process.env.OWNER_KEY = 'right-key' })
afterAll(async () => { await admin.flushdb(); admin.disconnect(); delete process.env.OWNER_KEY })

describe('views', () => {
  it('counts one view per visitor per post per day', async () => {
    expect((await view('tier-list')).body.views).toBe(1)
    expect((await view('tier-list')).body.views).toBe(1)
    expect((await view('tier-list', { ip: '10.0.0.2' })).body.views).toBe(2)
    expect((await view('other-post')).body.views).toBe(1)
    expect((await read('tier-list')).views).toBe(2)
    expect((await call({ query: { views: 'all' } })).body.views).toEqual({ 'tier-list': 2, 'other-post': 1 })
  })

  it('does not count crawlers', async () => {
    await view('tier-list', { ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' })
    expect((await read('tier-list')).views).toBe(0)
  })

  it('stores no raw IP', async () => {
    await view('tier-list', { ip: '203.0.113.77' })
    await comment('tier-list', { name: 'A', text: 'hello' }, { ip: '203.0.113.77' })
    const keys = await admin.keys('*')
    expect(keys.some(k => k.includes('203.0.113.77'))).toBe(false)
  })

  it('rejects bad slugs', async () => {
    for (const slug of ['', 'UPPER', '../x', 'a b', 'x'.repeat(81)]) {
      expect((await view(slug)).status).toBe(400)
    }
  })
})

describe('comments', () => {
  it('shows a plain comment at once, cleaned and in order', async () => {
    const r = await comment('tier-list', { name: '  Sam \n<b>', text: 'Salty Peanut is S tier.\r\n\r\n\r\n\r\nFight me' })
    expect(r.body).toMatchObject({ ok: true, status: 'visible', comment: { name: 'Sam b', text: 'Salty Peanut is S tier.\n\nFight me', owner: false } })
    await comment('tier-list', { text: 'second' }, { ip: '10.0.0.2' })
    const { comments } = await read('tier-list')
    expect(comments.map(c => [c.name, c.text.slice(0, 6)])).toEqual([['Sam b', 'Salty '], ['Anonymous', 'second']])
    expect(Object.keys(comments[0]).sort()).toEqual(['id', 'name', 'owner', 'text', 'ts'])
  })

  it('holds comments with links or the owner name for approval', async () => {
    for (const [i, f] of [{ text: 'cheap bars at http://spam.example' }, { text: 'visit www.spam.ru' }, { text: 'see bars.shop now' }, { name: 'Harit', text: 'it is me' }].entries()) {
      const r = await comment('tier-list', f, { ip: `10.0.1.${i}` })
      expect(r.body).toEqual({ ok: true, status: 'pending', comment: null })
    }
    expect((await read('tier-list')).comments).toHaveLength(0)
  })

  it('drops honeypot and crawler comments silently', async () => {
    expect((await comment('tier-list', { text: 'hi', website: 'x' })).body.status).toBe('pending')
    expect((await comment('tier-list', { text: 'hi' }, { ua: 'curl/8.0' })).body.status).toBe('pending')
    expect(await admin.keys('blog:c:*')).toEqual([])
  })

  it('rejects empty comments and trims long ones', async () => {
    expect((await comment('tier-list', { text: '   ' })).status).toBe(400)
    const r = await comment('tier-list', { text: 'x'.repeat(5000), name: 'n'.repeat(100) })
    expect(r.body.comment.text).toHaveLength(2000)
    expect(r.body.comment.name).toHaveLength(40)
  })

  it('rate-limits a fourth comment in ten minutes', async () => {
    const codes = []
    for (let i = 0; i < 4; i++) codes.push((await comment('tier-list', { text: `c${i}` })).status)
    expect(codes).toEqual([200, 200, 200, 429])
  })

  it('marks the owner, skips the rate limit, and rejects a wrong key', async () => {
    for (let i = 0; i < 4; i++) {
      const r = await comment('tier-list', { name: 'Harit', text: `reply ${i} https://github.com/x`, key: 'right-key' })
      expect(r.body).toMatchObject({ status: 'visible', comment: { owner: true } })
    }
    expect((await comment('tier-list', { name: 'Harit', text: 'fake', key: 'guess' })).status).toBe(401)
    expect((await read('tier-list')).comments).toHaveLength(4)
  })
})

describe('moderation', () => {
  it('lists, approves, hides and deletes', async () => {
    await comment('tier-list', { text: 'fine' })
    await comment('tier-list', { text: 'link http://x.example' }, { ip: '10.0.0.2' })
    await comment('other', { text: 'other post' }, { ip: '10.0.0.3' })

    let list = (await mod({ op: 'list' })).body
    expect(list.pending).toBe(1)
    const byText = t => list.comments.find(c => c.text === t)
    expect(list.comments.map(c => `${c.slug}:${c.status}`).sort()).toEqual(['other:visible', 'tier-list:pending', 'tier-list:visible'])

    const held = byText('link http://x.example')
    expect((await mod({ op: 'approve', ref: held.ref })).body.comment.status).toBe('visible')
    expect((await read('tier-list')).comments).toHaveLength(2)

    const fine = byText('fine')
    await mod({ op: 'hide', ref: fine.ref })
    expect((await read('tier-list')).comments.map(c => c.text)).toEqual(['link http://x.example'])

    await mod({ op: 'delete', ref: fine.ref })
    list = (await mod({ op: 'list' })).body
    expect(list.pending).toBe(0)
    expect(list.comments).toHaveLength(2)
    expect((await mod({ op: 'approve', ref: fine.ref })).status).toBe(404)
  })

  it('needs the key, locks after five misses, and validates input', async () => {
    for (let i = 0; i < 5; i++) expect((await mod({ op: 'list', key: 'nope' })).status).toBe(401)
    expect((await mod({ op: 'list' })).status).toBe(429)
    expect((await mod({ op: 'list' }, { ip: '10.0.0.9' })).status).toBe(200)
    expect((await mod({ op: 'approve', ref: '../../x' }, { ip: '10.0.0.9' })).status).toBe(400)
    expect((await mod({ op: 'nuke', ref: 'a/b' }, { ip: '10.0.0.9' })).status).toBe(400)
  })

  it('says so when no key is configured', async () => {
    delete process.env.OWNER_KEY
    expect((await mod({ op: 'list' })).status).toBe(503)
  })
})
