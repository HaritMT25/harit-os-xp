import { useState, useRef } from 'react'
import { EVOBOIDS_URL as DEMO_URL } from '../data/demo-urls'

// Why the embed is single-threaded: the threaded build needs
// SharedArrayBuffer, which browsers only allow on a cross-origin-isolated page
// (COOP + COEP headers). This site deliberately does not send those — they
// would break its other embeds — so an iframe here can never be isolated, and
// the demo's loader falls back to its single-threaded build on its own. The
// "full version" link opens the demo top-level, where its own headers apply.
export default function EvoBoids() {
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)
  const iframeRef = useRef(null)
  const live = !!DEMO_URL   // empty until the demo is deployed (see demo-urls.js)

  const openFull = () => window.open(DEMO_URL, '_blank', 'noopener,noreferrer')
  const reload = () => { setLoading(true); setNonce(n => n + 1) }
  const off = live ? {} : S.disabled

  return (
    <div style={S.container}>
      <div style={S.toolbar}>
        <span style={S.title}>🐟 evo_boids — evolving fish in your browser</span>
        <div style={S.tools}>
          <button style={{ ...S.btn, ...off }} onClick={reload} disabled={!live}
            title="Reload the simulation">🔄 Reload</button>
          <button style={{ ...S.btn, ...S.primary, ...off }} onClick={openFull} disabled={!live}
            title="Open the demo in a new tab, where it can use every CPU thread">
            Open full version ↗
          </button>
        </div>
      </div>

      <div style={S.info}>
        {live
          ? 'ℹ️ Runs single-threaded inside this window. The full version uses every CPU thread for bigger populations. Open the ☰ menu in the demo for settings; click a fish to see its brain.'
          : 'ℹ️ The live demo is being deployed — check back soon.'}
      </div>

      <div style={S.content}>
        {live ? (
          <>
            {loading && <div style={S.loadBar}><div style={S.loadFill} /></div>}
            <iframe key={nonce} ref={iframeRef} src={DEMO_URL} style={S.iframe}
              title="evo_boids simulation"
              onLoad={() => setLoading(false)} onError={() => setLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-downloads" />
          </>
        ) : (
          <div style={S.soon}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🐟</div>
            <div style={S.soonTitle}>evo_boids — coming soon</div>
            <p style={S.soonText}>
              An artificial-life simulation in C++20: each fish carries a genome that wires a small
              neural network, and there is no fitness function — fish that find food and partners
              leave offspring, the rest starve. It runs in the browser through WebAssembly.
            </p>
          </div>
        )}
      </div>

      <div style={S.status}>
        <span>{!live ? '🕓 Coming soon' : loading ? '⏳ Loading WebAssembly…' : '✅ Running'}</span>
        <span>C++20 → WebAssembly{live ? ' · single-threaded here' : ''}</span>
      </div>
    </div>
  )
}

const S = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Tahoma', sans-serif", fontSize: 11, background: '#0a120e' },
  toolbar: { background: 'var(--xp-surface)', borderBottom: '1px solid #a0a0a0', padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0 },
  title: { fontWeight: 700, color: '#003399', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tools: { display: 'flex', gap: 4, flexShrink: 0 },
  btn: { padding: '2px 10px', height: 22, border: '1px solid #7f9db9', borderRadius: 3, background: 'linear-gradient(180deg, #fff, #ece9d8)', cursor: 'pointer', fontSize: 11, fontFamily: "'Tahoma', sans-serif" },
  primary: { fontWeight: 700, color: '#1d4ed8', borderColor: '#93c5fd', background: 'linear-gradient(135deg, #eff6ff, #e0ecff)' },
  info: { background: '#ffffe1', borderBottom: '1px solid #c0c0a0', padding: '3px 8px', fontSize: 10, color: '#333', flexShrink: 0, lineHeight: 1.4 },
  content: { flex: 1, overflow: 'hidden', position: 'relative', background: '#0a120e' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },
  loadBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#ddd', zIndex: 10, overflow: 'hidden' },
  loadFill: { height: '100%', width: '30%', background: 'linear-gradient(90deg, #316ac5, #5a9ae8, #316ac5)', animation: 'ieLoading 1.5s ease-in-out infinite' },
  disabled: { opacity: 0.45, cursor: 'default' },
  soon: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, color: '#cfe0d5' },
  soonTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  soonText: { maxWidth: 460, fontSize: 11, lineHeight: 1.6, color: '#9fb8a9', margin: 0 },
  status: { background: 'var(--xp-surface)', borderTop: '1px solid #a0a0a0', padding: '2px 8px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', flexShrink: 0 },
}
