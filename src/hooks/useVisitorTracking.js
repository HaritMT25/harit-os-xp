import { useEffect } from 'react'

// Silent visitor pin — runs once per browser, city-level only.
// Geolocates via ipapi.co and posts to /api/visits.
// Degrades gracefully if either request fails.
export function useVisitorTracking() {
  useEffect(() => {
    if (localStorage.getItem('harit_visitor_pinned')) return
    // set flag IMMEDIATELY to prevent double-fire (React StrictMode, fast refresh, etc.)
    localStorage.setItem('harit_visitor_pinned', 'true')

    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (!data?.latitude) return
        const lat = Math.round((data.latitude || 0) * 10) / 10
        const lon = Math.round((data.longitude || 0) * 10) / 10
        const code = data.country_code || ''
        const flag = code ? code.toUpperCase().split('').map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('') : '🌍'
        fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Anonymous',
            city: data.city || 'Unknown',
            country: data.country_name || 'Unknown',
            lat, lon, flag,
            type: 'auto',
          }),
        }).catch(() => {})
      })
      .catch(() => {})
  }, [])
}
