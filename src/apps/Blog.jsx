import { useState, useRef, useCallback } from 'react'
import { useViewportSize, isPhoneViewport } from '../hooks/useViewport'

// The blog is a separate static site at /blog/ (see blog/), on this origin.
// This window shows it in an iframe with a small browser toolbar. Because it
// is same-origin, the toolbar can read the page title and drive history.
// Under `npm run dev` /blog/ doesn't exist; `npm run build && npm run preview`
// serves both, or point VITE_BLOG_URL at a running `npm run dev:blog`.
const BLOG_URL = import.meta.env.VITE_BLOG_URL || '/blog/'

export default function Blog() {
  const iframeRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("Harit's Blog")
  const [path, setPath] = useState(BLOG_URL)
  const { w, h } = useViewportSize()
  const phone = isPhoneViewport(w, h)

  const frame = () => {
    try { return iframeRef.current?.contentWindow || null } catch { return null }
  }

  const onLoad = useCallback(() => {
    setLoading(false)
    try {
      const win = iframeRef.current.contentWindow
      setTitle(win.document.title || "Harit's Blog")
      setPath(win.location.pathname + win.location.hash)
      // show the loading bar again when a link inside the blog is clicked
      win.addEventListener('beforeunload', () => setLoading(true))
    } catch { /* cross-origin (VITE_BLOG_URL elsewhere): title stays generic */ }
  }, [])

  const back = () => { try { frame()?.history.back() } catch {} }
  const home = () => { setLoading(true); iframeRef.current.src = BLOG_URL }
  const reload = () => { setLoading(true); try { frame()?.location.reload() } catch { iframeRef.current.src = BLOG_URL } }
  const openTab = () => {
    let href = BLOG_URL
    try { href = frame()?.location.href || BLOG_URL } catch {}
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={S.container}>
      <div style={S.toolbar}>
        <div style={S.tools}>
          <button style={S.btn} onClick={back} title="Back">◀{phone ? '' : ' Back'}</button>
          <button style={S.btn} onClick={home} title="All posts">🏠{phone ? '' : ' Posts'}</button>
          <button style={S.btn} onClick={reload} title="Reload">🔄</button>
        </div>
        {!phone && <div style={S.address} title={path}><span style={S.addrLabel}>Address</span>{path}</div>}
        <button style={{ ...S.btn, ...S.primary }} onClick={openTab} title="Open this page in a new tab">
          {phone ? 'Open ↗' : 'Open in new tab ↗'}
        </button>
      </div>

      <div style={S.content}>
        {loading && <div style={S.loadBar}><div style={S.loadFill} /></div>}
        <iframe ref={iframeRef} src={BLOG_URL} style={S.iframe} title="Harit's Blog" onLoad={onLoad} />
      </div>

      <div style={S.status}>
        <span style={S.statusText}>{loading ? '⏳ Loading…' : `✅ ${title}`}</span>
        <span>Done</span>
      </div>
    </div>
  )
}

const S = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Tahoma', sans-serif", fontSize: 11, background: '#fff' },
  toolbar: { background: 'var(--xp-surface)', borderBottom: '1px solid #a0a0a0', padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  tools: { display: 'flex', gap: 4, flexShrink: 0 },
  btn: { padding: '2px 8px', height: 22, border: '1px solid #7f9db9', borderRadius: 3, background: 'linear-gradient(180deg, #fff, #ece9d8)', cursor: 'pointer', fontSize: 11, fontFamily: "'Tahoma', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 },
  primary: { fontWeight: 700, color: '#1d4ed8', borderColor: '#93c5fd', background: 'linear-gradient(135deg, #eff6ff, #e0ecff)', marginLeft: 'auto' },
  address: { flex: 1, minWidth: 0, height: 22, display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px', background: '#fff', border: '1px solid #7f9db9', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  addrLabel: { color: '#777', flexShrink: 0 },
  content: { flex: 1, overflow: 'hidden', position: 'relative', background: '#faf9f6' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },
  loadBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#ddd', zIndex: 10, overflow: 'hidden' },
  loadFill: { height: '100%', width: '30%', background: 'linear-gradient(90deg, #316ac5, #5a9ae8, #316ac5)', animation: 'ieLoading 1.5s ease-in-out infinite' },
  status: { background: 'var(--xp-surface)', borderTop: '1px solid #a0a0a0', padding: '2px 8px', display: 'flex', justifyContent: 'space-between', gap: 8, color: '#333', flexShrink: 0 },
  statusText: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
}
