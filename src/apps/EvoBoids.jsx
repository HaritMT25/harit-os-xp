import { useState, useRef } from 'react'
import { EVOBOIDS_URL as DEMO_URL } from '../data/demo-urls'
import { useViewportSize, isPhoneViewport } from '../hooks/useViewport'

const ABOUT =
  'An artificial-life simulation in C++20: each fish carries a genome that wires a small ' +
  'neural network, and there is no fitness function — fish that find food and partners ' +
  'leave offspring, the rest starve. It runs in the browser through WebAssembly.'

// Why the embed is single-threaded: the threaded build needs
// SharedArrayBuffer, which browsers only allow on a cross-origin-isolated page
// (COOP + COEP headers). This site deliberately does not send those — they
// would break its other embeds — so an iframe here can never be isolated, and
// the demo's loader falls back to its single-threaded build on its own. The
// "full version" link opens the demo top-level, where its own headers apply.
//
// On a phone the window chrome takes about a third of the screen, so instead
// of embedding, the window describes the demo and opens it full screen (the
// demo has its own phone layout). "Run it in this window" still embeds. The
// choice is made once, when the window opens: a later resize or rotation
// never swaps a running simulation for the panel, or back.
export default function EvoBoids() {
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)
  const [launchPanel, setLaunchPanel] = useState(() => isPhoneViewport(window.innerWidth, window.innerHeight))
  const iframeRef = useRef(null)
  const { w, h } = useViewportSize()
  const live = !!DEMO_URL   // empty until the demo is deployed (see demo-urls.js)
  const phone = isPhoneViewport(w, h)   // shorter toolbar labels
  const embed = live && !launchPanel
  const chrome = embed || !live         // the launch panel has its own buttons

  const openFull = () => window.open(DEMO_URL, '_blank', 'noopener,noreferrer')
  const reload = () => { setLoading(true); setNonce(n => n + 1) }
  const runHere = () => { setLoading(true); setLaunchPanel(false) }
  const off = live ? {} : S.disabled

  return (
    <div style={S.container}>
      <div style={S.toolbar}>
        <span style={S.title}>🐟 evo_boids{phone ? '' : ' — evolving fish in your browser'}</span>
        {chrome && (
          <div style={S.tools}>
            <button style={{ ...S.btn, ...off }} onClick={reload} disabled={!live}
              title="Reload the simulation">🔄 Reload</button>
            <button style={{ ...S.btn, ...S.primary, ...off }} onClick={openFull} disabled={!live}
              title="Open the demo in a new tab, where it can use every CPU thread">
              {phone ? 'Open ↗' : 'Open full version ↗'}
            </button>
          </div>
        )}
      </div>

      {chrome && (
        <div style={phone ? { ...S.info, ...S.oneLine } : S.info}>
          {live
            ? 'ℹ️ Runs single-threaded inside this window. The full version uses every CPU thread for bigger populations. Open the ☰ menu in the demo for settings; click a fish to see its brain.'
            : 'ℹ️ The live demo is being deployed — check back soon.'}
        </div>
      )}

      <div style={S.content}>
        {embed ? (
          <>
            {loading && <div style={S.loadBar}><div style={S.loadFill} /></div>}
            <iframe key={nonce} ref={iframeRef} src={DEMO_URL} style={S.iframe}
              title="evo_boids simulation"
              onLoad={() => setLoading(false)} onError={() => setLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-downloads" />
          </>
        ) : live ? (
          <div style={S.panel}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🐟</div>
            <div style={S.panelTitle}>evo_boids — evolving fish</div>
            <p style={S.panelText}>{ABOUT}</p>
            <ul style={S.panelList}>
              <li>Tap a fish to see its neural network at work.</li>
              <li>The ☰ menu adds predators, ocean currents and food patches.</li>
            </ul>
            <button style={S.launch} onClick={openFull}>▶ Open the demo</button>
            <div style={S.launchNote}>Opens full screen in a new tab.</div>
            <button style={S.linkBtn} onClick={runHere}>
              or run it in this window
            </button>
          </div>
        ) : (
          <div style={S.panel}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🐟</div>
            <div style={S.panelTitle}>evo_boids — coming soon</div>
            <p style={S.panelText}>{ABOUT}</p>
          </div>
        )}
      </div>

      <div style={S.status}>
        <span>{!live ? '🕓 Coming soon' : !embed ? '📱 Ready to launch' : loading ? '⏳ Loading WebAssembly…' : '✅ Running'}</span>
        <span>C++20 → WebAssembly{embed ? ' · single-threaded here' : ''}</span>
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
  oneLine: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  content: { flex: 1, overflow: 'hidden', position: 'relative', background: '#0a120e' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },
  loadBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#ddd', zIndex: 10, overflow: 'hidden' },
  loadFill: { height: '100%', width: '30%', background: 'linear-gradient(90deg, #316ac5, #5a9ae8, #316ac5)', animation: 'ieLoading 1.5s ease-in-out infinite' },
  disabled: { opacity: 0.45, cursor: 'default' },
  panel: { height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, color: '#cfe0d5' },
  panelTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  panelText: { maxWidth: 460, fontSize: 12, lineHeight: 1.6, color: '#9fb8a9', margin: 0 },
  panelList: { maxWidth: 460, fontSize: 12, lineHeight: 1.6, color: '#9fb8a9', margin: '10px 0 0', paddingLeft: 18, textAlign: 'left' },
  launch: { marginTop: 20, minHeight: 48, padding: '0 28px', border: '1px solid #4a8a64', borderRadius: 6, background: 'linear-gradient(180deg, #2f6b4a, #1f4d35)', color: '#eaf6ee', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Tahoma', sans-serif" },
  launchNote: { marginTop: 6, fontSize: 11, color: '#7f9a8a' },
  linkBtn: { marginTop: 8, minHeight: 44, padding: '0 12px', border: 'none', background: 'none', color: '#8fc9a6', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', fontFamily: "'Tahoma', sans-serif" },
  status: { background: 'var(--xp-surface)', borderTop: '1px solid #a0a0a0', padding: '2px 8px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', flexShrink: 0 },
}
