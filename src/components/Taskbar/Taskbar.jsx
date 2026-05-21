import { useState, useEffect, useRef, useCallback } from 'react'
import APP_REGISTRY, { START_MENU_APPS } from '../../data/app-registry'

const QUICK_LINKS = [
  { label: 'My Documents', icon: '📂' },
  { label: 'My Pictures', icon: '🖼️' },
  { label: 'My Music', icon: '🎵' },
]

export default function Taskbar({ windows, windowOrder, onOpenWindow, onTaskbarClick, onNavigate }) {
  const [startOpen, setStartOpen] = useState(false)
  const [time, setTime] = useState(new Date())
  const startRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  // Close start menu when clicking outside
  useEffect(() => {
    if (!startOpen) return
    const handleClick = (e) => {
      if (startRef.current && !startRef.current.contains(e.target)) {
        setStartOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [startOpen])

  const handleStartClick = useCallback(() => {
    setStartOpen(prev => !prev)
  }, [])

  const openWindowIds = Object.keys(windows)
  const topWindowId = windowOrder[windowOrder.length - 1]

  return (
    <>
      {/* START MENU */}
      {startOpen && (
        <div ref={startRef} style={styles.startMenu}>
          {/* Header - User info */}
          <div style={styles.startHeader}>
            <div style={styles.startAvatar}>H</div>
            <div>
              <div style={styles.startName}>Harit</div>
              <div style={styles.startSubtitle}>MS CS · Northeastern University</div>
            </div>
          </div>

          {/* Main content area - two columns */}
          <div style={styles.startBody}>
            {/* Left column - Programs */}
            <div style={styles.startLeft}>
              {START_MENU_APPS.map((app) => (
                <StartMenuItem
                  key={app.id}
                  item={{ ...app, label: app.startMenuLabel || app.label }}
                  onClick={() => {
                    onOpenWindow(app.id)
                    setStartOpen(false)
                  }}
                />
              ))}
              <div style={styles.startSep} />
              <div style={{
                padding: '4px 10px',
                fontSize: 11,
                color: '#316ac5',
                fontWeight: 700,
                cursor: 'pointer',
              }}>
                All Programs ▸
              </div>
            </div>

            {/* Right column - Quick links */}
            <div style={styles.startRight}>
              {QUICK_LINKS.map((link, i) => (
                <div key={i} style={styles.quickLink}>
                  <span style={{ fontSize: 16 }}>{link.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 11 }}>{link.label}</span>
                </div>
              ))}
              <div style={styles.startSep} />
              <div style={styles.quickLink}>
                <span style={{ fontSize: 16 }}>🖥️</span>
                <span style={{ fontSize: 11 }}>Control Panel</span>
              </div>
              <div style={styles.quickLink}>
                <span style={{ fontSize: 16 }}>🖨️</span>
                <span style={{ fontSize: 11 }}>Printers</span>
              </div>
              <div style={styles.quickLink}>
                <span style={{ fontSize: 16 }}>❓</span>
                <span style={{ fontSize: 11 }}>Help and Support</span>
              </div>
              <div style={styles.quickLink}>
                <span style={{ fontSize: 16 }}>🔍</span>
                <span style={{ fontSize: 11 }}>Search</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.startFooter}>
            <div style={styles.footerBtn} onClick={() => { setStartOpen(false); onNavigate && onNavigate('quick') }}>
              <span style={{ fontSize: 14 }}>📋</span>
              <span>Quick Portfolio</span>
            </div>
            <div style={styles.footerBtn} onClick={() => { setStartOpen(false); onNavigate && onNavigate('shutdown') }}>
              <span style={{ fontSize: 14 }}>🔶</span>
              <span>Shut Down</span>
            </div>
          </div>
        </div>
      )}

      {/* TASKBAR */}
      <div style={styles.taskbar}>
        {/* Start Button */}
        <button
          onClick={handleStartClick}
          style={{
            ...styles.startButton,
            background: startOpen ? 'var(--xp-start-hover)' : 'var(--xp-start-bg)',
          }}
        >
          <span style={styles.startFlag}>
            <span style={{ color: '#ff3e3e' }}>⊞</span>
          </span>
          <span style={styles.startLabel}>start</span>
        </button>

        {/* Quick Launch */}
        <div style={styles.quickLaunch}>
          <div style={styles.qlDivider} />
          <button style={styles.qlButton} title="Show Desktop" onClick={() => {}}>🖥️</button>
          <button style={styles.qlButton} title="Terminal" onClick={() => onOpenWindow('terminal')}>💻</button>
          <button style={styles.qlButton} title="Projects" onClick={() => onOpenWindow('projects')}>📁</button>
          <div style={styles.qlDivider} />
        </div>

        {/* Window Tabs */}
        <div style={styles.windowTabs}>
          {openWindowIds.map((id) => {
            const isActive = topWindowId === id && !windows[id].minimized
            return (
              <button
                key={id}
                onClick={() => onTaskbarClick(id)}
                style={{
                  ...styles.windowTab,
                  background: isActive
                    ? 'linear-gradient(180deg, #fff 0%, #e8e8e0 30%, #d0d0c0 100%)'
                    : 'linear-gradient(180deg, #3c6fc7 0%, #2b55a0 50%, #234a90 100%)',
                  color: isActive ? '#000' : '#fff',
                  fontWeight: isActive ? 700 : 400,
                  border: isActive
                    ? '1px solid #0054e3'
                    : '1px solid rgba(0,0,50,0.3)',
                  boxShadow: isActive
                    ? 'inset 0 1px 0 #fff'
                    : 'inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <span style={{ fontSize: 12 }}>{APP_REGISTRY[id]?.icon}</span>
                <span style={styles.tabLabel}>{APP_REGISTRY[id]?.label}</span>
              </button>
            )
          })}
        </div>

        {/* System Tray */}
        <div style={styles.systemTray}>
          <div style={styles.trayIcons}>
            <span style={{ ...styles.trayIcon, cursor: 'pointer' }} title="Switch to Quick Portfolio" onClick={() => onNavigate && onNavigate('quick')}>📋</span>
            <span style={styles.trayIcon} title="Volume">🔊</span>
            <span style={styles.trayIcon} title="Network">🌐</span>
            <span style={styles.trayIcon} title="Security">🛡️</span>
          </div>
          <div style={styles.clock}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </>
  )
}

function StartMenuItem({ item, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        cursor: 'pointer',
        background: hover ? 'var(--xp-menu-highlight)' : 'transparent',
        borderRadius: 2,
      }}
    >
      <span style={{ fontSize: 24, width: 32, textAlign: 'center' }}>{item.icon}</span>
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: hover ? '#fff' : '#000',
        }}>{item.label}</div>
        <div style={{
          fontSize: 10,
          color: hover ? '#cce0ff' : '#666',
        }}>{item.desc}</div>
      </div>
    </div>
  )
}

const styles = {
  taskbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    zIndex: 9998,
    background: 'var(--xp-taskbar)',
    display: 'flex',
    alignItems: 'center',
    borderTop: '2px solid var(--xp-taskbar-border-top)',
    padding: '0 2px',
  },

  startButton: {
    height: 32,
    padding: '0 14px 0 6px',
    border: 'none',
    borderRadius: '0 10px 10px 0',
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontFamily: "'Trebuchet MS', 'Franklin Gothic Medium', sans-serif",
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)',
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  startFlag: {
    fontSize: 18,
    marginRight: 2,
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
  },
  startLabel: {
    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
    fontStyle: 'italic',
  },

  quickLaunch: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: '0 4px',
    flexShrink: 0,
  },
  qlDivider: {
    width: 1,
    height: 24,
    background: 'rgba(255,255,255,0.15)',
    margin: '0 2px',
  },
  qlButton: {
    width: 24,
    height: 24,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },

  windowTabs: {
    flex: 1,
    display: 'flex',
    gap: 3,
    padding: '0 4px',
    overflow: 'hidden',
  },
  windowTab: {
    height: 26,
    padding: '0 8px',
    borderRadius: 2,
    fontSize: 11,
    cursor: 'pointer',
    maxWidth: 180,
    minWidth: 50,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: "'Tahoma', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  tabLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  systemTray: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '0 8px 0 6px',
    background: 'var(--xp-tray)',
    borderLeft: '2px solid rgba(0,50,150,0.5)',
    flexShrink: 0,
  },
  trayIcons: {
    display: 'flex',
    gap: 3,
  },
  trayIcon: {
    fontSize: 13,
    cursor: 'pointer',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
  },
  clock: {
    fontSize: 11,
    color: '#fff',
    fontFamily: "'Tahoma', sans-serif",
    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
    marginLeft: 4,
    whiteSpace: 'nowrap',
  },

  // Start Menu
  startMenu: {
    position: 'fixed',
    bottom: 40,
    left: 0,
    width: 380,
    zIndex: 9999,
    background: '#fff',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.45)',
    border: '2px solid #0055e5',
    animation: 'startMenuSlide 0.15s ease-out',
  },
  startHeader: {
    background: 'linear-gradient(180deg, #2066d0 0%, #0e52b8 100%)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  startAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fff, #e0e0e0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 700,
    color: '#0054e3',
    border: '3px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    flexShrink: 0,
  },
  startName: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
    fontFamily: "'Tahoma', sans-serif",
  },
  startSubtitle: {
    color: '#a8ccff',
    fontSize: 10,
    fontFamily: "'Tahoma', sans-serif",
  },
  startBody: {
    display: 'flex',
    minHeight: 260,
  },
  startLeft: {
    flex: 1,
    padding: '6px 0',
    borderRight: '1px solid #d6d2c2',
    background: '#fff',
  },
  startRight: {
    width: 150,
    padding: '6px 0',
    background: '#d3e5fa',
  },
  quickLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: "'Tahoma', sans-serif",
  },
  startSep: {
    height: 1,
    background: '#d0d0d0',
    margin: '4px 8px',
  },
  startFooter: {
    background: 'var(--xp-surface)',
    borderTop: '1px solid #b0b0b0',
    padding: '6px 10px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  footerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: "'Tahoma', sans-serif",
    color: '#333',
    fontWeight: 600,
  },
}
