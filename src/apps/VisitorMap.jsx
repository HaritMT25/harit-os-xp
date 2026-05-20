import { useState, useEffect, useRef, useCallback } from 'react'

const GEO_URL = 'https://ipapi.co/json/'
const API_URL = '/api/visits'
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

function getFlagEmoji(code) {
  if (!code) return '🌍'
  return code.toUpperCase().split('').map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('')
}

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
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // opt-in state
  const [dropping, setDropping] = useState(false)
  const [myLocation, setMyLocation] = useState(null)
  const [name, setName] = useState('')
  const [pinDropped, setPinDropped] = useState(false)

  // init map + load existing pins
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

    // load existing visits
    safeFetchJson(API_URL).then(data => {
      if (cancelled) return
      if (data) {
        setAllVisits(data.visits || [])
        setTotalCount(data.total || data.visits?.length || 0)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
      if (mapInstanceRef.current) { try { mapInstanceRef.current.remove() } catch {} }
      mapInstanceRef.current = null
    }
  }, [])

  // render existing pins on map
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    import('leaflet').then((L) => {
      markersRef.current.forEach(m => { try { m.remove() } catch {} })
      markersRef.current = []

      const pins = allVisits.reduce((acc, v) => {
        const key = `${(v.lat || 0).toFixed(1)},${(v.lon || 0).toFixed(1)}`
        if (!acc.map[key]) { acc.map[key] = { ...v, count: 1 }; acc.list.push(acc.map[key]) }
        else { acc.map[key].count++; if (v.name !== 'Anonymous') acc.map[key].name = v.name }
        return acc
      }, { map: {}, list: [] }).list

      pins.forEach(v => {
        const sz = Math.min(8 + v.count * 2, 20)
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:#4488ff;border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 6px rgba(68,136,255,0.3)"></div>`,
          iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
        })
        const m = L.marker([v.lat, v.lon], { icon }).addTo(map)
        m.bindPopup(`<div style="font-family:Tahoma,sans-serif;font-size:11px;min-width:90px"><strong>${v.flag || '🌍'} ${v.name || 'Anonymous'}</strong><br>${v.city}, ${v.country}${v.count > 1 ? `<br><span style="color:#888">${v.count} visits</span>` : ''}</div>`)
        markersRef.current.push(m)
      })

      // add my pin if dropped
      if (myLocation && pinDropped) {
        const icon = L.divIcon({
          className: '',
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#ff4466;border:2px solid #fff;box-shadow:0 0 10px rgba(255,68,102,0.6)"></div>',
          iconSize: [14, 14], iconAnchor: [7, 7],
        })
        const m = L.marker([myLocation.lat, myLocation.lon], { icon }).addTo(map)
        m.bindPopup(`<div style="font-family:Tahoma,sans-serif;font-size:11px"><strong>${myLocation.flag} ${name || 'You'}</strong><br>${myLocation.city}, ${myLocation.country}</div>`)
        markersRef.current.push(m)
      }
    }).catch(() => {})
  }, [allVisits, myLocation, pinDropped, name])

  // user clicks "drop pin" — geolocate then register
  const handleDropPin = useCallback(async () => {
    setDropping(true)
    const data = await safeFetchJson(GEO_URL)
    const loc = data ? {
      city: data.city || 'Unknown', country: data.country_name || 'Earth',
      lat: data.latitude || 0, lon: data.longitude || 0,
      flag: getFlagEmoji(data.country_code),
    } : { city: 'Unknown', country: 'Earth', lat: 20, lon: 0, flag: '🌍' }

    setMyLocation(loc)
    setDropping(false)

    // fly to location
    try { if (mapInstanceRef.current) mapInstanceRef.current.flyTo([loc.lat, loc.lon], 5, { duration: 1.5 }) } catch {}
  }, [])

  const handleSign = useCallback(() => {
    if (!myLocation) return
    const displayName = name.trim() || 'Anonymous'
    safeFetchJson(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: displayName, city: myLocation.city, country: myLocation.country, lat: myLocation.lat, lon: myLocation.lon, flag: myLocation.flag }),
    })
    setPinDropped(true)
  }, [name, myLocation])

  return (
    <div style={styles.container}>
      {/* header */}
      <div style={styles.header}>
        <span style={{ fontSize: 22 }}>🌍</span>
        <div style={{ flex: 1 }}>
          <div style={styles.headerTitle}>Visitor Map</div>
          <div style={styles.headerSub}>
            {loading ? 'Loading pins...' : allVisits.length > 0 ? `${allVisits.length} pins dropped around the world` : 'Be the first to drop a pin'}
          </div>
        </div>
        <div style={styles.counter}>
          <div style={styles.counterNum}>{allVisits.length}</div>
          <div style={styles.counterLabel}>pins</div>
        </div>
      </div>

      {/* map */}
      <div ref={mapRef} style={styles.mapDiv} />

      {/* drop pin bar */}
      <div style={styles.guestbook}>
        {pinDropped ? (
          <div style={styles.signed}>
            📍 {name || 'Anonymous'} was here — {myLocation?.city}, {myLocation?.country} {myLocation?.flag}
          </div>
        ) : !myLocation ? (
          <div style={styles.signRow}>
            <span style={styles.signLabel}>Want to leave your mark?</span>
            <button style={styles.dropBtn} onClick={handleDropPin} disabled={dropping}>
              {dropping ? 'Locating...' : '📍 Drop a pin'}
            </button>
          </div>
        ) : (
          <div style={styles.signRow}>
            <span style={styles.signLabel}>{myLocation.flag} {myLocation.city}, {myLocation.country} ·</span>
            <input
              style={styles.signInput} value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={e => { if (e.key === 'Enter') handleSign() }}
            />
            <button style={styles.anonBtn} onClick={() => { setName(''); handleSign() }}>Anonymous</button>
            <button style={styles.signBtn} onClick={handleSign}>Sign ✍️</button>
          </div>
        )}
      </div>

      {/* recent */}
      {allVisits.length > 0 && (
        <div style={styles.recentBar}>
          <span style={styles.recentLabel}>Recent:</span>
          {allVisits.slice(0, 8).map((v, i) => <span key={i} style={styles.recentChip}>{v.flag} {v.name}</span>)}
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
  counter: { textAlign: 'center', padding: '4px 12px', background: '#12283f', borderRadius: 6, border: '1px solid #1a3a5c' },
  counterNum: { color: '#4488ff', fontSize: 18, fontWeight: 700, lineHeight: 1 },
  counterLabel: { color: '#4a7a9c', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1 },
  mapDiv: { flex: 1, background: '#0a1628' },
  guestbook: { padding: '10px 14px', background: '#0d1f35', borderTop: '1px solid #1a3050', flexShrink: 0 },
  signRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  signLabel: { color: '#6a9ec8', fontSize: 12, flexShrink: 0 },
  signInput: { flex: 1, minWidth: 120, padding: '6px 10px', border: '1px solid #1a3a5c', borderRadius: 4, background: '#081420', color: '#ddd', fontSize: 11, fontFamily: "'Tahoma', sans-serif", outline: 'none' },
  dropBtn: { padding: '7px 16px', border: '1px solid #3a7a9c', borderRadius: 5, background: 'linear-gradient(180deg, #2a6a8c, #1a4a6c)', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: "'Tahoma', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' },
  signBtn: { padding: '6px 14px', border: '1px solid #2a5a7c', borderRadius: 4, background: 'linear-gradient(180deg, #1a4a6c, #0d2840)', color: '#88c8e8', cursor: 'pointer', fontSize: 11, fontFamily: "'Tahoma', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' },
  anonBtn: { padding: '6px 10px', border: '1px solid #1a3a5c', borderRadius: 4, background: 'transparent', color: '#4a7a9c', cursor: 'pointer', fontSize: 10, fontFamily: "'Tahoma', sans-serif", whiteSpace: 'nowrap' },
  signed: { color: '#66ddaa', fontSize: 12, padding: '2px 0' },
  recentBar: { padding: '4px 12px 6px', background: '#081420', borderTop: '1px solid #0d1f35', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, overflow: 'hidden' },
  recentLabel: { color: '#3a6a8c', fontSize: 9, flexShrink: 0 },
  recentChip: { padding: '1px 6px', background: '#12283f', borderRadius: 8, fontSize: 9, color: '#6a9ec8', whiteSpace: 'nowrap' },
}
