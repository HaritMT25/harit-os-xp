import { useState } from 'react'

// live project bookmarks — flip `ready` to true and add url when deployed
const BOOKMARKS = [
  {
    name: '🤖 Agentic AI Website',
    url: 'https://genui-hackathon.vercel.app/',
    description: 'Interactive agentic AI demo',
    ready: true,
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
    name: '🤖 Roboxers Demo',
    url: '',
    description: 'RL locomotion visualization',
    ready: false,
  },
]

export default function InternetExplorer() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [addressText, setAddressText] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = (url) => {
    if (!url) return
    setCurrentUrl(url)
    setAddressText(url)
    setLoading(true)
  }

  const goHome = () => {
    setCurrentUrl('')
    setAddressText('')
    setLoading(false)
  }

  const readyBookmarks = BOOKMARKS.filter(b => b.ready)
  const hasContent = currentUrl !== ''

  return (
    <div style={styles.container}>
      {/* toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolRow}>
          <button style={styles.navBtn} onClick={goHome} title="Home">🏠</button>
          <button style={styles.navBtn} onClick={() => setLoading(false)} title="Stop">✖</button>
          <button style={styles.navBtn} onClick={() => currentUrl && setLoading(true)} title="Refresh">🔄</button>
          <div style={styles.addressBar}>
            <span style={styles.addressIcon}>🌐</span>
            <input
              style={styles.addressInput}
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && addressText.trim()) {
                  let url = addressText.trim()
                  if (!url.startsWith('http')) url = 'https://' + url
                  navigate(url)
                }
              }}
              placeholder="Enter a URL..."
              spellCheck={false}
            />
            <button
              style={styles.goBtn}
              onClick={() => {
                if (addressText.trim()) {
                  let url = addressText.trim()
                  if (!url.startsWith('http')) url = 'https://' + url
                  navigate(url)
                }
              }}
            >Go</button>
          </div>
        </div>
      </div>

      {/* bookmarks bar */}
      <div style={styles.bookmarksBar}>
        <span style={styles.bookmarksLabel}>⭐ Projects:</span>
        {BOOKMARKS.map((bm, i) => (
          <button
            key={i}
            style={{
              ...styles.bookmarkBtn,
              opacity: bm.ready ? 1 : 0.45,
              cursor: bm.ready ? 'pointer' : 'default',
            }}
            onClick={() => bm.ready && navigate(bm.url)}
            title={bm.ready ? bm.description : `${bm.description} — coming soon`}
            disabled={!bm.ready}
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* content */}
      <div style={styles.content}>
        {!hasContent ? (
          <div style={styles.homePage}>
            <div style={styles.homeHeader}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌐</div>
              <h1 style={styles.homeTitle}>Internet Explorer</h1>
              <p style={styles.homeSubtitle}>Live project demos</p>
            </div>
            <div style={styles.bookmarksGrid}>
              {BOOKMARKS.map((bm, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.bookmarkCard,
                    opacity: bm.ready ? 1 : 0.5,
                    cursor: bm.ready ? 'pointer' : 'default',
                  }}
                  onClick={() => bm.ready && navigate(bm.url)}
                >
                  <div style={styles.bookmarkCardIcon}>{bm.name.split(' ')[0]}</div>
                  <div style={styles.bookmarkCardName}>
                    {bm.name.split(' ').slice(1).join(' ')}
                  </div>
                  <div style={styles.bookmarkCardDesc}>{bm.description}</div>
                  {!bm.ready && (
                    <div style={styles.comingSoon}>Coming Soon</div>
                  )}
                </div>
              ))}
            </div>
            {readyBookmarks.length === 0 && (
              <p style={styles.homeNote}>
                Project demos will be available here once deployed.
                Enter any URL in the address bar to browse.
              </p>
            )}
          </div>
        ) : (
          <>
            {loading && (
              <div style={styles.loadingBar}>
                <div style={styles.loadingBarFill} />
              </div>
            )}
            <iframe
              src={currentUrl}
              style={styles.iframe}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              title="Project Demo"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </>
        )}
      </div>

      {/* status */}
      <div style={styles.statusBar}>
        <span>{loading ? '⏳ Loading...' : '✅ Done'}</span>
        <span>{currentUrl ? '🔒 Secure' : '🏠 Home'}</span>
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Tahoma', sans-serif", fontSize: 11, background: '#fff' },
  toolbar: { background: 'var(--xp-surface)', borderBottom: '1px solid #a0a0a0', padding: '3px 4px', flexShrink: 0 },
  toolRow: { display: 'flex', alignItems: 'center', gap: 3 },
  navBtn: { width: 28, height: 24, border: '1px solid transparent', borderRadius: 3, background: 'transparent', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addressBar: { flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #7f9db9', borderRadius: 2, background: '#fff', height: 22, overflow: 'hidden' },
  addressIcon: { padding: '0 4px', fontSize: 12, flexShrink: 0 },
  addressInput: { flex: 1, border: 'none', outline: 'none', fontSize: 11, fontFamily: "'Tahoma', sans-serif", padding: '0 4px', height: '100%' },
  goBtn: { padding: '0 10px', height: '100%', border: 'none', borderLeft: '1px solid #7f9db9', background: 'linear-gradient(180deg, #fff, #ece9d8)', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Tahoma', sans-serif" },
  bookmarksBar: { background: '#f7f6f0', borderBottom: '1px solid #d0d0d0', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, overflow: 'hidden' },
  bookmarksLabel: { fontSize: 10, color: '#666', marginRight: 4, flexShrink: 0 },
  bookmarkBtn: { padding: '2px 8px', border: '1px solid transparent', borderRadius: 2, background: 'transparent', fontSize: 10, fontFamily: "'Tahoma', sans-serif", whiteSpace: 'nowrap' },
  content: { flex: 1, overflow: 'hidden', position: 'relative', background: '#fff' },
  iframe: { width: '100%', height: '100%', border: 'none' },
  loadingBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#ddd', zIndex: 10, overflow: 'hidden' },
  loadingBarFill: { height: '100%', width: '30%', background: 'linear-gradient(90deg, #316ac5, #5a9ae8, #316ac5)', animation: 'ieLoading 1.5s ease-in-out infinite' },
  statusBar: { background: 'var(--xp-surface)', borderTop: '1px solid #a0a0a0', padding: '2px 8px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', flexShrink: 0 },
  homePage: { height: '100%', overflow: 'auto', background: 'linear-gradient(180deg, #e8f0fe 0%, #fff 40%)', padding: 24 },
  homeHeader: { textAlign: 'center', marginBottom: 24 },
  homeTitle: { fontSize: 18, fontWeight: 700, color: '#003399', margin: '0 0 4px' },
  homeSubtitle: { fontSize: 12, color: '#666' },
  homeNote: { textAlign: 'center', fontSize: 11, color: '#999', marginTop: 20, fontStyle: 'italic' },
  bookmarksGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, maxWidth: 600, margin: '0 auto' },
  bookmarkCard: { border: '1px solid #ddd', borderRadius: 6, padding: 16, textAlign: 'center', background: '#fff', position: 'relative' },
  bookmarkCardIcon: { fontSize: 28, marginBottom: 8 },
  bookmarkCardName: { fontWeight: 700, fontSize: 11, color: '#222', marginBottom: 4 },
  bookmarkCardDesc: { fontSize: 9, color: '#888' },
  comingSoon: { position: 'absolute', top: 6, right: 6, fontSize: 8, background: '#f0f0f0', color: '#999', padding: '1px 5px', borderRadius: 3, fontWeight: 600 },
}
