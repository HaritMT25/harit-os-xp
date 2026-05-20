// mode switch button — used in quick portfolio nav, footer, and xp taskbar tray
// keeps all mode-switching UI in one place

export function XPModeButton({ onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      title="Try the full XP experience"
      style={{
        padding: '6px 14px',
        border: '1px solid #ddd',
        borderRadius: 6,
        background: '#fff',
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: 'inherit',
        fontWeight: 600,
        color: '#555',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      🖥️ XP Mode
    </button>
  )
}

export function QuickModeButton({ onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      title="Switch to Quick Portfolio"
      style={{
        padding: '6px 14px',
        border: '1px solid #ddd',
        borderRadius: 6,
        background: '#fff',
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: 'inherit',
        fontWeight: 600,
        color: '#555',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      📋 Quick View
    </button>
  )
}

export function XPBanner({ onClick }) {
  return (
    <div style={bannerStyles.container}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>🖥️</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={bannerStyles.title}>Want the full experience?</div>
        <div style={bannerStyles.subtitle}>Interactive Windows XP desktop with 10+ apps</div>
      </div>
      <button onClick={onClick} style={bannerStyles.btn}>Launch XP Mode</button>
    </div>
  )
}

const bannerStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 20px',
    background: '#f0f7ff',
    border: '1px solid #c0d8f0',
    borderRadius: 10,
    flexWrap: 'wrap',
  },
  title: { fontWeight: 600, fontSize: 13, color: '#333' },
  subtitle: { fontSize: 11, color: '#888' },
  btn: {
    padding: '8px 18px',
    border: '1px solid #0078d7',
    borderRadius: 6,
    background: '#0078d7',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    marginLeft: 'auto',
  },
}
