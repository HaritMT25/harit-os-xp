import { useState, useEffect } from 'react'

export default function MSNPopup({ onOpenWindow, delay = 18000 }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay, dismissed])

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!visible || dismissed) return
    const timer = setTimeout(() => handleClose(), 8000)
    return () => clearTimeout(timer)
  }, [visible, dismissed])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setDismissed(true)
      setClosing(false)
    }, 300)
  }

  const handleClick = () => {
    onOpenWindow('contact')
    handleClose()
  }

  if (!visible || dismissed) return null

  return (
    <div
      style={{
        ...styles.container,
        animation: closing ? 'msnSlideDown 0.3s ease-in forwards' : 'msnSlideUp 0.4s ease-out',
      }}
      onClick={handleClick}
    >
      {/* MSN header */}
      <div style={styles.header}>
        <span style={styles.headerIcon}>💬</span>
        <span style={styles.headerTitle}>MSN Messenger</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleClose() }}
          style={styles.closeBtn}
        >✕</button>
      </div>

      {/* Content */}
      <div style={styles.body}>
        <div style={styles.avatar}>
          <div style={styles.avatarLetter}>H</div>
          <div style={styles.onlineDot} />
        </div>
        <div style={styles.message}>
          <div style={styles.sender}>Harit</div>
          <div style={styles.status}>
            is <strong>online</strong> and open to opportunities 🟢
          </div>
          <div style={styles.cta}>Click to get in touch</div>
        </div>
      </div>

      {/* MSN sound indicator */}
      <div style={styles.footer}>
        <span style={styles.footerIcon}>🔔</span>
        <span style={styles.footerText}>Click to open Contact</span>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 42,
    right: 8,
    width: 260,
    zIndex: 9985,
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden',
    boxShadow: '0 -2px 16px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    border: '1px solid #0054e3',
    fontFamily: "'Tahoma', sans-serif",
  },
  header: {
    background: 'linear-gradient(180deg, #1f6de7, #0050d0)',
    padding: '5px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: { fontSize: 12 },
  headerTitle: {
    color: '#fff', fontSize: 11, fontWeight: 700, flex: 1,
    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#fff',
    fontSize: 11, cursor: 'pointer', fontWeight: 700, padding: '0 2px',
  },

  body: {
    background: '#fff',
    padding: '10px 12px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  avatar: {
    position: 'relative', flexShrink: 0,
  },
  avatarLetter: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e5799, #7db9e8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 16, fontWeight: 700,
    border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: '50%',
    background: '#4caf50', border: '2px solid #fff',
  },
  message: { flex: 1 },
  sender: { fontSize: 12, fontWeight: 700, color: '#003399' },
  status: { fontSize: 11, color: '#444', marginTop: 2, lineHeight: 1.4 },
  cta: { fontSize: 9, color: '#888', marginTop: 4, fontStyle: 'italic' },

  footer: {
    background: '#f0f0e8',
    padding: '4px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderTop: '1px solid #d0d0d0',
  },
  footerIcon: { fontSize: 10 },
  footerText: { fontSize: 9, color: '#888' },
}

