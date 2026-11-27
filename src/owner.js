// Owner mode: once the owner key is entered on the Visitor Map, this browser
// stops counting as a visitor (map, GA4, Vercel Analytics, blog views). The
// blog under /blog shares this origin, so it reads the same key.
const OWNER_KEY = 'harit_owner_key'

function get(k) { try { return localStorage.getItem(k) } catch { return null } }
function set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch {} }

export function ownerKey() { return get(OWNER_KEY) || '' }
export function isOwner() { return !!ownerKey() }

// Unlock against the server. Resolves 'ok' | 'bad' | 'locked' | 'unset' | 'offline'.
export async function unlockOwner(key) {
  const counted = !!get('harit_visitor_pinned') && !get('harit_visitor_discounted')
  let r
  try {
    r = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'owner', key, discount: counted, cell: get('harit_visitor_cell') || '' }),
    })
  } catch { return 'offline' }
  let body = null
  try { body = await r.json() } catch {}
  if (r.ok && body?.ok) {
    set(OWNER_KEY, key)
    if (counted) set('harit_visitor_discounted', '1')
    return 'ok'
  }
  return body?.error || 'offline'
}

export function forgetOwner() { set(OWNER_KEY, null) }
