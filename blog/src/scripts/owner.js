// Shared with the XP site: the Visitor Map's key button stores the owner key
// here, and the blog lives on the same origin, so it sees the same value.
const KEY = 'harit_owner_key'

export function ownerKey() {
  try { return localStorage.getItem(KEY) || '' } catch { return '' }
}
export const isOwner = () => !!ownerKey()
export function setOwnerKey(k) {
  try { k ? localStorage.setItem(KEY, k) : localStorage.removeItem(KEY) } catch {}
}

export async function api(method, body, query = '') {
  try {
    const r = await fetch(`/api/blog${query}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    let data = null
    try { data = await r.json() } catch {}
    return { ok: r.ok, status: r.status, data: data || {} }
  } catch {
    return { ok: false, status: 0, data: {} }
  }
}

export const fmtDate = ts => new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
export const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`
