import { useEffect } from 'react'

// Silent visitor pin — runs once per browser, city-level only.
// Geo is resolved server-side from Vercel request headers, so no third-party
// geolocation call to be rate-limited or blocked by an ad blocker.
export function useVisitorTracking() {
  useEffect(() => {
    if (localStorage.getItem('harit_visitor_pinned')) return
    // set flag IMMEDIATELY to prevent double-fire (React StrictMode, fast refresh, etc.)
    localStorage.setItem('harit_visitor_pinned', 'true')

    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Anonymous', type: 'auto' }),
    }).catch(() => {})
  }, [])
}
