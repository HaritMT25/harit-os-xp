import { useState, useCallback, useRef } from 'react'

const GENUI_URL = 'https://genui-hackathon.vercel.app'

const BOOKMARKS = [
  {
    name: '✨ AI Page Builder',
    url: GENUI_URL,
    description: 'AI designs full landing pages — then you control colors, fonts, tone',
    ready: true,
    featured: true,
  },
  {
    name: '🕉️ SriDarshan',
    url: '',
    description: 'Gujarati/Hindi temple chatbot',
    ready: false,
  },
  {
    name: '🎰 Kazam',
    url: '',
    description: 'Scratch card promo platform',
    ready: false,
  },
  {
    name: '🤖 Roboxers',
    url: '',
    description: 'RL locomotion visualization',
    ready: false,
  },
]

export default function InternetExplorer() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [addressText, setAddressText] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyStack, setHistoryStack] = useState([])
  const [forwardStack, setForwardStack] = useState([])
  const iframeRef = useRef(null)

  const navigate = useCallback((url, addToHistory = true) => {
    if (!url) return
    if (addToHistory && currentUrl) {
      setHistoryStack(prev => [...prev, currentUrl])
      setForwardStack([])
    }
    setCurrentUrl(url)
    setAddressText(url)
    setLoading(true)
  }, [currentUrl])

  const goBack = useCallback(() => {
    if (!historyStack.length) return
    const prev = historyStack.at(-1)
    setForwardStack(fwd => [currentUrl, ...fwd])
    setHistoryStack(h => h.slice(0, -1))
    setCurrentUrl(prev)
    setAddressText(prev)
    setLoading(true)
  }, [historyStack, currentUrl])

  const goForward = useCallback(() => {
    if (!forwardStack.length) return
    const next = forwardStack[0]
    setHistoryStack(h => [...h, currentUrl])
    setForwardStack(fwd => fwd.slice(1))
    setCurrentUrl(next)
    setAddressText(next)
    setLoading(true)
  }, [forwardStack, currentUrl])

  const goHome = useCallback(() => {
    if (currentUrl) {
      setHistoryStack(prev => [...prev, currentUrl])
      setForwardStack([])
    }
    setCurrentUrl('')
    setAddressText('')
    setLoading(false)
  }, [currentUrl])

  const handleGo = useCallback(() => {
    if (!addressText.trim()) return
    let url = addressText.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    navigate(url)
  }, [addressText, navigate])

  const getHostname = (url) => { try { return new URL(url).hostname } catch { return url.slice(0, 30) } }
  const hasContent = currentUrl !== ''

  return (
    <div style={S.container}>
      {/* Tab bar */}
      <div style={S.tabBar}>
        <div style={S.tab}>
          <span style={S.tabIcon}>{hasContent ? '🌐' : '🏠'}</span>
          <span style={S.tabTitle}>{hasContent ? getHostname(currentUrl) : 'Home'}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <div style={S.toolRow}>
          <button onClick={goBack} disabled={!historyStack.length}
            style={{ ...S.navBtn, opacity: historyStack.length ? 1 : 0.35 }} title="Back">◀</button>
          <button onClick={goForward} disabled={!forwardStack.length}
            style={{ ...S.navBtn, opacity: forwardStack.length ? 1 : 0.35 }} title="Forward">▶</button>
          <button style={S.navBtn} onClick={() => loading ? setLoading(false) : (currentUrl && setLoading(true))}
            title={loading ? 'Stop' : 'Refresh'}>{loading ? '✖' : '🔄'}</button>
          <button style={S.navBtn} onClick={goHome} title="Home">🏠</button>

          <div style={S.addressBar}>
            {hasContent && <span style={S.secBadge}>🔒</span>}
            <input style={S.addressInput} value={addressText} onChange={e => setAddressText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGo() }} placeholder="Enter a URL…" spellCheck={false} />
            <button style={S.goBtn} onClick={handleGo}>Go</button>
          </div>
        </div>
      </div>

      {/* Bookmarks bar */}
      <div style={S.bkBar}>
        <span style={S.bkLabel}>⭐ Links:</span>
        {BOOKMARKS.map((bm, i) => (
          <button key={i}
            style={{ ...S.bkBtn, opacity: bm.ready ? 1 : 0.45, cursor: bm.ready ? 'pointer' : 'default', ...(bm.featured && bm.ready ? S.bkFeatured : {}) }}
            onClick={() => bm.ready && navigate(bm.url)}
            title={bm.ready ? bm.description : `${bm.description} — coming soon`}
            disabled={!bm.ready}>
            {bm.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={S.content}>
        {!hasContent ? (
          <div style={S.homePage}>
            <div style={S.homeHeader}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🌐</div>
              <h1 style={S.homeTitle}>Internet Explorer</h1>
              <p style={S.homeSub}>Project demos & live apps</p>
            </div>

            {/* Featured */}
            <div style={S.featured} onClick={() => navigate(GENUI_URL)}>
              <div style={S.featBadge}>✨ FEATURED — HACKATHON PROJECT</div>
              <h2 style={S.featTitle}>Generative Control Surfaces</h2>
              <p style={S.featDesc}>
                Describe any business → AI designs a complete landing page from scratch.
                Then tweak colors, fonts, spacing, and tone with interactive controls.
                Export clean HTML.
              </p>
              <div style={S.featCta}>Launch AI Page Builder →</div>
            </div>

            {/* Grid */}
            <div style={S.grid}>
              {BOOKMARKS.filter(b => !b.featured).map((bm, i) => (
                <div key={i} style={{ ...S.card, opacity: bm.ready ? 1 : 0.5, cursor: bm.ready ? 'pointer' : 'default' }}
                  onClick={() => bm.ready && navigate(bm.url)}>
                  <div style={S.cardIcon}>{bm.name.split(' ')[0]}</div>
                  <div style={S.cardName}>{bm.name.split(' ').slice(1).join(' ')}</div>
                  <div style={S.cardDesc}>{bm.description}</div>
                  {!bm.ready && <div style={S.soon}>Coming Soon</div>}
                </div>
              ))}
            </div>

            <p style={S.homeNote}>Click the featured project above, or enter any URL in the address bar.</p>
          </div>
        ) : (
          <>
            {loading && <div style={S.loadBar}><div style={S.loadFill} /></div>}
            <iframe ref={iframeRef} src={currentUrl} style={S.iframe}
              onLoad={() => setLoading(false)} onError={() => setLoading(false)}
              title="Web Page" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          </>
        )}
      </div>

      {/* Status */}
      <div style={S.status}>
        <span>{loading ? '⏳ Loading…' : hasContent ? '✅ Done' : '🏠 Home'}</span>
        <span>{hasContent ? '🔒 Secure' : ''}{historyStack.length > 0 ? ` · ${historyStack.length} in history` : ''}</span>
      </div>
    </div>
  )
}

const S = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Tahoma', sans-serif", fontSize: 11, background: '#fff' },

  tabBar: { display: 'flex', background: 'linear-gradient(180deg, #ece9d8, #d6d2c2)', borderBottom: '1px solid #a0a0a0', flexShrink: 0, padding: '0 2px' },
  tab: { display: 'flex', alignItems: 'center', gap: 4, padding: '4px 14px 3px', background: '#fff', border: '1px solid #a0a0a0', borderBottom: '1px solid #fff', borderRadius: '4px 4px 0 0', marginTop: 2, marginBottom: -1, fontSize: 10, zIndex: 1 },
  tabIcon: { fontSize: 10 },
  tabTitle: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 },

  toolbar: { background: 'var(--xp-surface)', borderBottom: '1px solid #a0a0a0', padding: '3px 4px', flexShrink: 0 },
  toolRow: { display: 'flex', alignItems: 'center', gap: 3 },
  navBtn: { width: 28, height: 24, border: '1px solid transparent', borderRadius: 3, background: 'transparent', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addressBar: { flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #7f9db9', borderRadius: 2, background: '#fff', height: 22, overflow: 'hidden' },
  secBadge: { padding: '0 4px', fontSize: 11, flexShrink: 0 },
  addressInput: { flex: 1, border: 'none', outline: 'none', fontSize: 11, fontFamily: "'Tahoma', sans-serif", padding: '0 4px', height: '100%' },
  goBtn: { padding: '0 10px', height: '100%', border: 'none', borderLeft: '1px solid #7f9db9', background: 'linear-gradient(180deg, #fff, #ece9d8)', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Tahoma', sans-serif" },

  bkBar: { background: '#f7f6f0', borderBottom: '1px solid #d0d0d0', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, overflow: 'hidden' },
  bkLabel: { fontSize: 10, color: '#666', marginRight: 4, flexShrink: 0 },
  bkBtn: { padding: '2px 8px', border: '1px solid transparent', borderRadius: 2, background: 'transparent', fontSize: 10, fontFamily: "'Tahoma', sans-serif", whiteSpace: 'nowrap', cursor: 'pointer' },
  bkFeatured: { background: 'linear-gradient(135deg, #eff6ff, #e0ecff)', border: '1px solid #93c5fd', borderRadius: 3, fontWeight: 700, color: '#1d4ed8' },

  content: { flex: 1, overflow: 'hidden', position: 'relative', background: '#fff' },
  iframe: { width: '100%', height: '100%', border: 'none' },
  loadBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#ddd', zIndex: 10, overflow: 'hidden' },
  loadFill: { height: '100%', width: '30%', background: 'linear-gradient(90deg, #316ac5, #5a9ae8, #316ac5)', animation: 'ieLoading 1.5s ease-in-out infinite' },

  status: { background: 'var(--xp-surface)', borderTop: '1px solid #a0a0a0', padding: '2px 8px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', flexShrink: 0 },

  homePage: { height: '100%', overflow: 'auto', background: 'linear-gradient(180deg, #e8f0fe 0%, #fff 40%)', padding: 24 },
  homeHeader: { textAlign: 'center', marginBottom: 24 },
  homeTitle: { fontSize: 18, fontWeight: 700, color: '#003399', margin: '0 0 4px' },
  homeSub: { fontSize: 12, color: '#666' },
  homeNote: { textAlign: 'center', fontSize: 11, color: '#999', marginTop: 20, lineHeight: 1.5 },

  featured: { maxWidth: 500, margin: '0 auto 24px', padding: 24, background: 'linear-gradient(135deg, #1e293b, #334155)', borderRadius: 10, cursor: 'pointer', textAlign: 'center', border: '1px solid #475569', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' },
  featBadge: { fontSize: 9, color: '#fbbf24', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 8 },
  featTitle: { fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 8px' },
  featDesc: { fontSize: 11, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px' },
  featCta: { display: 'inline-block', padding: '8px 20px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 700 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, maxWidth: 500, margin: '0 auto' },
  card: { border: '1px solid #ddd', borderRadius: 6, padding: 16, textAlign: 'center', background: '#fff', position: 'relative' },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardName: { fontWeight: 700, fontSize: 11, color: '#222', marginBottom: 4 },
  cardDesc: { fontSize: 9, color: '#888' },
  soon: { position: 'absolute', top: 6, right: 6, fontSize: 8, background: '#f0f0f0', color: '#999', padding: '1px 5px', borderRadius: 3, fontWeight: 600 },
}