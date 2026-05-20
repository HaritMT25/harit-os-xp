import { useState } from 'react'

export default function WelcomeDialog({ onClose }) {
  const [tab, setTab] = useState('welcome')

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div style={styles.titleBar}>
          <span style={styles.titleIcon}>ℹ️</span>
          <span style={styles.titleText}>Welcome to HaritOS XP</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          <button
            style={{
              ...styles.tab,
              ...(tab === 'welcome' ? styles.tabActive : {}),
            }}
            onClick={() => setTab('welcome')}
          >
            Welcome
          </button>
          <button
            style={{
              ...styles.tab,
              ...(tab === 'disclaimer' ? styles.tabActive : {}),
            }}
            onClick={() => setTab('disclaimer')}
          >
            Disclaimer
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {tab === 'welcome' ? (
            <div style={styles.welcomeContent}>
              <div style={styles.welcomeIcon}>
                <div style={styles.logoText}>
                  <span style={{ color: '#fff' }}>Harit</span>
                  <span style={{ color: '#ff8c00' }}>OS</span>
                  <span style={{ color: '#4fc3f7' }}> XP</span>
                </div>
              </div>
              <h2 style={styles.welcomeTitle}>Welcome!</h2>
              <p style={styles.welcomeText}>
                This is an interactive portfolio website styled as a Windows XP desktop.
                Double-click the desktop icons or use the Start menu to explore.
              </p>
              <div style={styles.tips}>
                <div style={styles.tip}>
                  <span style={styles.tipIcon}>🖱️</span>
                  <span><b>Double-click</b> desktop icons to open apps</span>
                </div>
                <div style={styles.tip}>
                  <span style={styles.tipIcon}>📌</span>
                  <span><b>Drag</b> window title bars to move them</span>
                </div>
                <div style={styles.tip}>
                  <span style={styles.tipIcon}>↔️</span>
                  <span><b>Resize</b> windows from any edge or corner</span>
                </div>
                <div style={styles.tip}>
                  <span style={styles.tipIcon}>💻</span>
                  <span>Try the <b>Terminal</b> — type <code style={styles.code}>help</code> or <code style={styles.code}>theme silver</code></span>
                </div>
                <div style={styles.tip}>
                  <span style={styles.tipIcon}>🤖</span>
                  <span>Chat with <b>HaritBot</b> — an AI that knows my entire resume</span>
                </div>
                <div style={styles.tip}>
                  <span style={styles.tipIcon}>💣</span>
                  <span>Take a break with <b>Minesweeper</b> (right-click to flag)</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.disclaimerContent}>
              <h3 style={styles.disclaimerTitle}>Disclaimer</h3>
              <div style={styles.disclaimerBox}>
                <p style={styles.disclaimerText}>
                  <b>Regarding Visual Assets</b>
                </p>
                <p style={styles.disclaimerText}>
                  This project is a work of parody and is intended for educational,
                  portfolio, and demonstrative purposes only. It is an original implementation
                  that evokes a classic operating system interface for the web.
                </p>
                <p style={styles.disclaimerText}>
                  The visual aesthetic of the Windows XP operating system, including the
                  Luna theme design language, is the intellectual property of{' '}
                  <b>Microsoft Corporation</b>. This project does not use any actual
                  Microsoft assets — all visuals are original CSS approximations. No
                  ownership of Microsoft's design language is claimed.
                </p>
                <p style={styles.disclaimerText}>
                  <b>Inspiration Credit</b>
                </p>
                <p style={styles.disclaimerText}>
                  The concept of a portfolio website styled as a desktop OS was inspired
                  by numerous creative developers in the web community. This project was
                  built entirely from scratch using React and Vite — no code from any
                  other project was used.
                </p>
                <p style={styles.disclaimerText}>
                  <b>License</b>
                </p>
                <p style={styles.disclaimerText}>
                  This project's source code is released under the MIT License.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <label style={styles.checkLabel}>
            <input type="checkbox" style={styles.checkbox} defaultChecked />
            <span>Show this at startup</span>
          </label>
          <button style={styles.okBtn} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50000,
    animation: 'fadeIn 0.2s',
  },
  dialog: {
    width: 460,
    background: 'var(--xp-surface)',
    borderRadius: '8px 8px 4px 4px',
    boxShadow: '0 6px 30px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    border: '1px solid #0054e3',
  },
  titleBar: {
    background: 'var(--xp-titlebar-active)',
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleIcon: { fontSize: 14 },
  titleText: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    fontFamily: "'Tahoma', sans-serif",
    flex: 1,
  },
  closeBtn: {
    width: 22,
    height: 22,
    border: '1px solid rgba(100,0,0,0.4)',
    borderRadius: 3,
    background: 'var(--xp-btn-close)',
    color: '#fff',
    fontSize: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBar: {
    background: 'var(--xp-surface)',
    padding: '4px 8px 0',
    display: 'flex',
    gap: 1,
  },
  tab: {
    padding: '5px 16px',
    border: '1px solid #a0a0a0',
    borderBottom: 'none',
    borderRadius: '4px 4px 0 0',
    background: '#d6d2c2',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: "'Tahoma', sans-serif",
    color: '#333',
  },
  tabActive: {
    background: 'var(--xp-surface)',
    borderBottom: '1px solid var(--xp-surface)',
    fontWeight: 700,
    marginBottom: -1,
    position: 'relative',
    zIndex: 1,
  },

  content: {
    border: '1px solid #a0a0a0',
    margin: '0 8px',
    background: '#fff',
    minHeight: 280,
    overflow: 'auto',
  },

  // Welcome tab
  welcomeContent: {
    padding: 20,
    fontFamily: "'Tahoma', sans-serif",
    fontSize: 11,
  },
  welcomeIcon: {
    textAlign: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "'Trebuchet MS', sans-serif",
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#003399',
    margin: '0 0 8px',
    textAlign: 'center',
  },
  welcomeText: {
    color: '#333',
    lineHeight: 1.6,
    margin: '0 0 16px',
    textAlign: 'center',
  },
  tips: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  tip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#444',
    lineHeight: 1.4,
  },
  tipIcon: { fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 },
  code: {
    background: '#f0f0f0',
    padding: '1px 4px',
    borderRadius: 2,
    fontFamily: "'Consolas', monospace",
    fontSize: 10,
  },

  // Disclaimer tab
  disclaimerContent: {
    padding: 16,
    fontFamily: "'Tahoma', sans-serif",
    fontSize: 11,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#003399',
    margin: '0 0 10px',
  },
  disclaimerBox: {
    background: '#f8f8f8',
    border: '1px solid #e0e0e0',
    borderRadius: 3,
    padding: 12,
    maxHeight: 220,
    overflowY: 'auto',
  },
  disclaimerText: {
    margin: '0 0 8px',
    lineHeight: 1.6,
    color: '#333',
    fontSize: 10,
  },

  // Footer
  footer: {
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: '#333',
    fontFamily: "'Tahoma', sans-serif",
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
  },
  okBtn: {
    padding: '4px 24px',
    border: '1px solid #003c74',
    borderRadius: 3,
    background: 'linear-gradient(180deg, #fff, #ece9d8)',
    cursor: 'pointer',
    fontFamily: "'Tahoma', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    boxShadow: '0 0 0 1px #4080d0',
  },
}
