import { useEffect } from 'react'
import { isOwner } from '../owner'

// Silent visitor pin — runs once per browser, city-level only.
// Geo is resolved server-side from Vercel request headers, so no third-party
// geolocation call to be rate-limited or blocked by an ad blocker.
export function useVisitorTracking() {
  useEffect(() => {
    if (isOwner() || localStorage.getItem('harit_visitor_pinned')) return
    // set flag IMMEDIATELY to prevent double-fire (React StrictMode, fast refresh, etc.)
    localStorage.setItem('harit_visitor_pinned', 'true')

    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Anonymous', type: 'auto' }),
    })
      .then(r => r.json())
      .then(d => {
        // remembered so owner mode can later take back exactly this visit
        if (d?.visit && (d.visit.lat || d.visit.lon)) localStorage.setItem('harit_visitor_cell', `${d.visit.lat},${d.visit.lon}`)
      })
      .catch(() => {})
  }, [])
}
