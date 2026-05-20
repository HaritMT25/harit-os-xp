import { useState, useEffect, useRef, useCallback } from 'react'

const GEO_URL = 'https://ipapi.co/json/'
const API_URL = '/api/visits'
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

function getFlagEmoji(code) {
  if (!code) return '🌍'
  return code.toUpperCase().split('').map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('')
}

function roundCoord(n) { return Math.round((n || 0) * 10) / 10 }

async function safeFetchJson(url, opts) {
  try {
    const r = await fetch(url, opts)
    if (!r.ok) return null
    const ct = r.headers.get('content-type') || ''
    if (!ct.includes('application/json')) return null
    return await r.json()
  } catch { return null }
}

export default function VisitorMap() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  const [allVisits, setAllVisits] = useState([])
  const [myLocation, setMyLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(() => localStorage.getItem('harit_visitor_name') || '')
  const [named, setNamed] = useState(() => !!localStorage.getItem('harit_visitor_name'))

  // init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false
    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return
      try {
        const map = L.map(mapRef.current, {
          center: [20, 0], zoom: 2, minZoom: 2, maxZoom: 10,
          zoomControl: true, attributionControl: false,
        })
        L.tileLayer(TILE_URL, { subdomains: 'abcd', maxZoom: 19 }).addTo(map)
        mapInstanceRef.current = map
        setTimeout(() => { if (map._container) map.invalidateSize() }, 200)
      } catch {}
    }).catch(() => {})
    return () => { cancelled = true; if (mapInstanceRef.current) { try { mapInstanceRef.current.remove() } catch {} }; mapInstanceRef.current = null }
  }, [])

  // geolocate (just for display, not registering — App.jsx handles that) + load visits
  useEffect(() => {
    let cancelled = false
    safeFetchJson(GEO_URL).then(data => {
      if (cancelled) return
      if (data) {
        setMyLocation({
          city: data.city || 'Unknown', country: data.country_name || 'Earth',
          lat: roundCoord(data.latitude), lon: roundCoord(data.longitude),
          flag: getFlagEmoji(data.country_code),
        })
        try { if (mapInstanceRef.current) mapInstanceRef.current.flyTo([data.latitude, data.longitude], 4, { duration: 1.5 }) } catch {}
      }
    }).then(() => safeFetchJson(API_URL)).then(data => {
      if (cancelled) return
      if (data) setAllVisits(data.visits || [])
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // render pins — blue for anonymous, gold for named
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    import('leaflet').then((L) => {
      markersRef.current.forEach(m => { try { m.remove() } catch {} })
      markersRef.current = []

      // cluster
      const pins = allVisits.reduce((acc, v) => {
        const key = `${roundCoord(v.lat)},${roundCoord(v.lon)}`
        if (!acc.map[key]) {
          acc.map[key] = { ...v, count: 1, hasNamed: v.name !== 'Anonymous' }
          acc.list.push(acc.map[key])
        } else {
          acc.map[key].count++
          if (v.name !== 'Anonymous') { acc.map[key].name = v.name; acc.map[key].hasNamed = true }
        }
        return acc
      }, { map: {}, list: [] }).list

      pins.forEach(v => {
        const isMe = myLocation && Math.abs(v.lat - myLocation.lat) < 1 && Math.abs(v.lon - myLocation.lon) < 1
        const isNamed = v.hasNamed
        const sz = Math.min(8 + v.count * 2, 22)

        // color: red = you, gold = named visitors, blue = anonymous
        const color = isMe ? '#ff4466' : isNamed ? '#ffb800' : '#4488ff'
        const glow = isMe ? 'rgba(255,68,102,0.5)' : isNamed ? 'rgba(255,184,0,0.4)' : 'rgba(68,136,255,0.3)'
        const border = isMe ? '#fff' : isNamed ? '#fff' : 'rgba(255,255,255,0.5)'

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${color};border:2px solid ${border};box-shadow:0 0 ${isMe ? 10 : 6}px ${glow}"></div>`,
          iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
        })
        const m = L.marker([v.lat, v.lon], { icon }).addTo(map)
        const nameLabel = isNamed ? v.name : 'Anonymous'
        m.bindPopup(`<div style="font-family:Tahoma,sans-serif;font-size:11px;min-width:90px"><strong>${v.flag || '🌍'} ${nameLabel}</strong><br>${v.city}, ${v.country}${v.count > 1 ? `<br><span style="color:#888">${v.count} visitors</span>` : ''}</div>`)
        markersRef.current.push(m)
      })

      // my pin if not covered
      if (myLocation && !pins.some(v => Math.abs(v.lat - myLocation.lat) < 1 && Math.abs(v.lon - myLocation.lon) < 1)) {
        const icon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;border-radius:50%;background:#ff4466;border:2px solid #fff;box-shadow:0 0 10px rgba(255,68,102,0.6)"></div>', iconSize: [14, 14], iconAnchor: [7, 7] })
        const m = L.marker([myLocation.lat, myLocation.lon], { icon }).addTo(map)
        m.bindPopup(`<div style="font-family:Tahoma,sans-serif;font-size:11px"><strong>${myLocation.flag} You</strong><br>${myLocation.city}, ${myLocation.country}</div>`)
        markersRef.current.push(m)
      }
    }).catch(() => {})
  }, [allVisits, myLocation])

  // upgrade from anonymous to named
  const handleName = useCallback(() => {
    if (!name.trim() || !myLocation) return
    safeFetchJson(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), city: myLocation.city, country: myLocation.country, lat: myLocation.lat, lon: myLocation.lon, flag: myLocation.flag, type: 'named' }),
    })
    localStorage.setItem('harit_visitor_name', name.trim())
    setNamed(true)
  }, [name, myLocation])

  const anonCount = allVisits.filter(v => v.name === 'Anonymous').length
  const namedCount = allVisits.filter(v => v.name !== 'Anonymous').length

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={{ fontSize: 22 }}>🌍</span>
        <div style={{ flex: 1 }}>
          <div style={styles.headerTitle}>Visitor Map</div>
          <div style={styles.headerSub}>
            {loading ? 'Locating you...' : myLocation ? `${myLocation.flag} ${myLocation.city}, ${myLocation.country}` : 'Explore visitor pins'}
          </div>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#4488ff' }} />{anonCount}</span>
          <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#ffb800' }} />{namedCount}</span>
        </div>
        <div style={styles.counter}>
          <div style={styles.counterNum}>{allVisits.length}</div>
          <div style={styles.counterLabel}>pins</div>
        </div>
      </div>

      <div ref={mapRef} style={styles.mapDiv} />

      <div style={styles.bar}>
        {named ? (
          <div style={styles.signed}>📍 {name} was here — {myLocation?.city}, {myLocation?.country} {myLocation?.flag}</div>
        ) : myLocation ? (
          <div style={styles.signRow}>
            <span style={styles.signLabel}>Leave your name to turn your <span style={{ color: '#4488ff' }}>●</span> into a <span style={{ color: '#ffb800' }}>●</span></span>
            <input
              style={styles.signInput} value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={e => { if (e.key === 'Enter') handleName() }}
            />
            <button style={styles.signBtn} onClick={handleName} disabled={!name.trim()}>Sign ✍️</button>
          </div>
        ) : (
          <div style={styles.signLabel}>{loading ? 'Loading...' : 'Your pin has been dropped'}</div>
        )}
      </div>

      {allVisits.length > 0 && (
        <div style={styles.recentBar}>
          <span style={styles.recentLabel}>Recent:</span>
          {allVisits.slice(0, 10).map((v, i) => (
            <span key={i} style={{
              ...styles.recentChip,
              borderColor: v.name !== 'Anonymous' ? '#ffb80040' : '#4488ff30',
            }}>{v.flag} {v.name}</span>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Tahoma', sans-serif", fontSize: 11, background: '#0a1628' },
  header: { background: 'linear-gradient(180deg, #0d1f35, #0a1628)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: '1px solid #1a3050' },
  headerTitle: { color: '#fff', fontWeight: 700, fontSize: 14 },
  headerSub: { color: '#6a9ec8', fontSize: 11, marginTop: 1 },
  legend: { display: 'flex', gap: 8, alignItems: 'center', marginRight: 4 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#6a9ec8' },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  counter: { textAlign: 'center', padding: '4px 12px', background: '#12283f', borderRadius: 6, border: '1px solid #1a3a5c' },
  counterNum: { color: '#4488ff', fontSize: 18, fontWeight: 700, lineHeight: 1 },
  counterLabel: { color: '#4a7a9c', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1 },
  mapDiv: { flex: 1, background: '#0a1628' },
  bar: { padding: '10px 14px', background: '#0d1f35', borderTop: '1px solid #1a3050', flexShrink: 0 },
  signRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  signLabel: { color: '#6a9ec8', fontSize: 11, flexShrink: 0 },
  signInput: { flex: 1, minWidth: 100, padding: '5px 8px', border: '1px solid #1a3a5c', borderRadius: 3, background: '#081420', color: '#ddd', fontSize: 11, fontFamily: "'Tahoma', sans-serif", outline: 'none' },
  signBtn: { padding: '5px 12px', border: '1px solid #2a5a7c', borderRadius: 3, background: 'linear-gradient(180deg, #1a4a6c, #0d2840)', color: '#88c8e8', cursor: 'pointer', fontSize: 11, fontFamily: "'Tahoma', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' },
  signed: { color: '#66ddaa', fontSize: 12, padding: '2px 0' },
  recentBar: { padding: '4px 12px 6px', background: '#081420', borderTop: '1px solid #0d1f35', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, overflow: 'hidden' },
  recentLabel: { color: '#3a6a8c', fontSize: 9, flexShrink: 0 },
  recentChip: { padding: '1px 6px', background: '#12283f', borderRadius: 8, fontSize: 9, color: '#6a9ec8', whiteSpace: 'nowrap', border: '1px solid transparent' },
}
