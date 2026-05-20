import { useState, useCallback, useRef } from 'react'

// initial icon positions — left column for core, right for interactive/featured
const DESKTOP_ICONS = [
  // left column
  { id: 'about',       label: 'About Me',     icon: '👤', x: 16, y: 12 },
  { id: 'resume',      label: 'My Resume',    icon: '📄', x: 16, y: 92 },
  { id: 'projects',    label: 'My Projects',  icon: '📁', x: 16, y: 172 },
  { id: 'skills',      label: 'Skills',       icon: '⚙️', x: 16, y: 252 },
  { id: 'contact',     label: 'Contact Me',   icon: '✉️', x: 16, y: 332 },
  { id: 'terminal',    label: 'Terminal',      icon: '💻', x: 16, y: 412 },
  // top center — visitor map
  { id: 'visitor',     label: 'Visitor Map',   icon: '🌍', x: 350, y: 12 },
  // right column — featured
  { id: 'ai',          label: 'HaritBot',      icon: '🤖', x: -90, y: 12, fromRight: true },
  { id: 'ie',          label: 'Internet\nExplorer', icon: '🌐', x: -90, y: 92, fromRight: true },
  { id: 'notepad',     label: 'Notepad',       icon: '📝', x: -90, y: 172, fromRight: true },
  { id: 'minesweeper', label: 'Minesweeper',   icon: '💣', x: -90, y: 252, fromRight: true },
]

export default function Desktop({ onOpenWindow }) {
  const [positions, setPositions] = useState(() => {
    const pos = {}
    DESKTOP_ICONS.forEach(icon => {
      pos[icon.id] = {
        x: icon.fromRight ? window.innerWidth + icon.x : icon.x,
        y: icon.y,
      }
    })
    return pos
  })
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const dragRef = useRef(null)

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
    setSelectedIcon(null)
  }, [])

  const handleClick = useCallback(() => {
    setContextMenu(null)
    setSelectedIcon(null)
  }, [])

  const isTouch = 'ontouchstart' in window

  // unified pointer handling — works for mouse and touch
  const handlePointerDown = useCallback((e, id) => {
    e.stopPropagation()
    setSelectedIcon(id)
    setContextMenu(null)

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const startX = clientX - positions[id].x
    const startY = clientY - positions[id].y
    let moved = false

    const handleMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY
      const dx = Math.abs(cx - clientX)
      const dy = Math.abs(cy - clientY)
      if (dx > 5 || dy > 5) moved = true
      if (moved) {
        setPositions(prev => ({
          ...prev,
          [id]: {
            x: Math.max(0, Math.min(cx - startX, window.innerWidth - 80)),
            y: Math.max(0, Math.min(cy - startY, window.innerHeight - 120)),
          },
        }))
      }
    }

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleUp)

      // touch: single tap opens (if didn't drag)
      // mouse: just select (double-click opens)
      if (isTouch && !moved) {
        onOpenWindow(id)
      }
      dragRef.current = moved ? 'dragged' : null
    }

    dragRef.current = null
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleUp)
  }, [positions, onOpenWindow])

  const handleDoubleClick = useCallback((id) => {
    if (dragRef.current === 'dragged') { dragRef.current = null; return }
    onOpenWindow(id)
  }, [onOpenWindow])

  return (
    <div
      style={styles.desktop}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* wallpaper */}
      <div style={styles.wallpaper}>
        <div style={styles.sky} />
        <div style={{ ...styles.cloud, top: '6%', left: '12%', width: 180, height: 55 }} />
        <div style={{ ...styles.cloud, top: '10%', left: '55%', width: 240, height: 70 }} />
        <div style={{ ...styles.cloud, top: '14%', left: '30%', width: 120, height: 40 }} />
        <div style={{ ...styles.cloud, top: '4%', left: '75%', width: 160, height: 50 }} />
      </div>

      {/* draggable icons */}
      {DESKTOP_ICONS.map((icon) => (
        <div
          key={icon.id}
          onMouseDown={(e) => handlePointerDown(e, icon.id)}
          onTouchStart={(e) => handlePointerDown(e, icon.id)}
          onDoubleClick={() => handleDoubleClick(icon.id)}
          style={{
            position: 'absolute',
            left: positions[icon.id]?.x || 0,
            top: positions[icon.id]?.y || 0,
            ...styles.iconItem,
            background: selectedIcon === icon.id ? 'rgba(50, 100, 200, 0.35)' : 'transparent',
            border: selectedIcon === icon.id ? '1px dotted rgba(255,255,255,0.6)' : '1px solid transparent',
          }}
        >
          <div style={styles.iconEmoji}>{icon.icon}</div>
          <span style={{
            ...styles.iconLabel,
            background: selectedIcon === icon.id ? '#316ac5' : 'transparent',
          }}>
            {icon.label}
          </span>
        </div>
      ))}

      {/* context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={(action) => {
            if (action === 'about') onOpenWindow('about')
            if (action === 'terminal') onOpenWindow('terminal')
            setContextMenu(null)
          }}
        />
      )}
    </div>
  )
}

function ContextMenu({ x, y, onAction }) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const ax = Math.min(x, window.innerWidth - 180)
  const ay = Math.min(y, window.innerHeight - 200)

  const items = [
    { label: 'Refresh', action: () => window.location.reload() },
    null,
    { label: 'Open Terminal', action: () => onAction('terminal') },
    { label: 'About HaritOS XP', action: () => onAction('about') },
    null,
    { label: 'Properties' },
  ]

  return (
    <div style={{ ...styles.contextMenu, left: ax, top: ay }} onClick={e => e.stopPropagation()}>
      {items.map((item, i) =>
        item === null ? (
          <div key={i} style={styles.menuSep} />
        ) : (
          <div
            key={i}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            onClick={item.action}
            style={{
              padding: '4px 28px 4px 24px', fontSize: 11, fontFamily: "'Tahoma', sans-serif",
              cursor: item.action ? 'pointer' : 'default',
              background: hoverIdx === i ? 'var(--xp-menu-highlight)' : 'transparent',
              color: hoverIdx === i ? '#fff' : '#000',
            }}
          >{item.label}</div>
        )
      )}
    </div>
  )
}

const styles = {
  desktop: { position: 'absolute', inset: 0, overflow: 'hidden', animation: 'desktopFadeIn 0.5s ease-out' },
  wallpaper: { position: 'absolute', inset: 0 },
  sky: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, #245ec5 0%, #3a78d6 15%, #5a9ae8 30%, #7cb8f0 42%, #a0d4f8 48%, #8cc63f 50%, #a8d84e 55%, #9cc840 60%, #7cb82f 68%, #6aab25 75%, #5a9e1e 82%, #4a8f16 90%, #3d7a14 100%)',
  },
  cloud: { position: 'absolute', background: 'rgba(255,255,255,0.45)', borderRadius: '50%', filter: 'blur(14px)' },

  iconItem: {
    width: 80, padding: '8px 4px 6px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4, cursor: 'pointer', borderRadius: 3, textAlign: 'center',
    zIndex: 1, userSelect: 'none',
  },
  iconEmoji: {
    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))',
  },
  iconLabel: {
    fontSize: 11, fontFamily: "'Tahoma', sans-serif", color: '#fff',
    textShadow: '1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.5)',
    lineHeight: 1.2, padding: '1px 3px', borderRadius: 2, wordBreak: 'break-word', maxWidth: 76,
    whiteSpace: 'pre-line',
  },

  contextMenu: {
    position: 'fixed', background: '#fff', border: '1px solid #888',
    boxShadow: '2px 4px 8px rgba(0,0,0,0.25)', padding: '3px 0', zIndex: 50000, minWidth: 170,
    animation: 'menuPop 0.1s ease-out',
  },
  menuSep: { height: 1, background: '#ccc', margin: '3px 2px' },
}
