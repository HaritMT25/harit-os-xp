import { useRef, useCallback, useState, useEffect } from 'react'

const WINDOW_TITLES = {
  about:    { title: 'About Me', icon: '👤' },
  resume:   { title: 'My Resume', icon: '📄' },
  projects: { title: 'My Projects — Explorer', icon: '📁' },
  skills:   { title: 'Skills & Technologies', icon: '⚙️' },
  contact:  { title: 'Contact Me — Outlook Express', icon: '✉️' },
  terminal: { title: 'C:\\WINDOWS\\system32\\cmd.exe', icon: '💻' },
  ie:       { title: 'Internet Explorer — Live Demos', icon: '🌐' },
  notepad:  { title: 'Untitled - Notepad', icon: '📝' },
  minesweeper: { title: 'Minesweeper', icon: '💣' },
  ai:          { title: 'HaritBot — AI Assistant', icon: '🤖' },
  visitor:     { title: 'Visitor Map', icon: '🌍' },
}

export default function Window({
  id, windowState, zIndex, isActive,
  onFocus, onClose, onMinimize, onMaximize, onMove, onResize,
  children,
}) {
  const titleRef = useRef(null)
  const windowRef = useRef(null)
  const [animState, setAnimState] = useState('opening')

  useEffect(() => {
    const timer = setTimeout(() => setAnimState('open'), 200)
    return () => clearTimeout(timer)
  }, [])

  const { position, size, maximized, minimized, closing } = windowState
  const meta = WINDOW_TITLES[id] || { title: id, icon: '📋' }

  // dragging — mouse + touch
  const handleTitleDown = useCallback((e) => {
    if (maximized) return
    e.preventDefault()
    onFocus(id)
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    const startX = cx - position.x
    const startY = cy - position.y

    const handleMove = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY
      onMove(id, { x: Math.max(0, mx - startX), y: Math.max(0, my - startY) })
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleUp)
  }, [id, position, maximized, onFocus, onMove])

  // Resizing
  const handleResizeMouseDown = useCallback((e, direction) => {
    if (maximized) return
    e.preventDefault()
    e.stopPropagation()
    onFocus(id)

    const startX = e.clientX
    const startY = e.clientY
    const startW = size.w
    const startH = size.h
    const startPosX = position.x
    const startPosY = position.y

    const handleMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let newW = startW, newH = startH, newX = startPosX, newY = startPosY

      if (direction.includes('e')) newW = Math.max(300, startW + dx)
      if (direction.includes('s')) newH = Math.max(200, startH + dy)
      if (direction.includes('w')) {
        newW = Math.max(300, startW - dx)
        newX = startPosX + (startW - newW)
      }
      if (direction.includes('n')) {
        newH = Math.max(200, startH - dy)
        newY = startPosY + (startH - newH)
      }

      onResize(id, { w: newW, h: newH })
      onMove(id, { x: newX, y: newY })
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [id, size, position, maximized, onFocus, onResize, onMove])

  if (minimized) return null

  const anim = closing ? 'windowClose' : animState === 'opening' ? 'windowOpen' : 'none'

  return (
    <div
      ref={windowRef}
      onClick={() => onFocus(id)}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.w,
        height: size.h,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: maximized ? 0 : '8px 8px 4px 4px',
        boxShadow: isActive
          ? '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 2px 10px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        border: `1px solid ${isActive ? '#0050d0' : '#6878a0'}`,
        animation: anim !== 'none' ? `${anim} 0.15s ease-out forwards` : undefined,
        userSelect: 'none',
      }}
    >
      {/* ---- TITLE BAR ---- */}
      <div
        ref={titleRef}
        onMouseDown={handleTitleDown}
        onTouchStart={handleTitleDown}
        onDoubleClick={() => onMaximize(id)}
        style={{
          background: isActive
            ? 'var(--xp-titlebar-active)'
            : 'var(--xp-titlebar-inactive)',
          height: 30,
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px 0 6px',
          cursor: maximized ? 'default' : 'move',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, marginRight: 4, filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
          {meta.icon}
        </span>
        <span style={{
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: "'Tahoma', sans-serif",
        }}>
          {meta.title}
        </span>

        {/* Window buttons */}
        <div style={{ display: 'flex', gap: 2 }}>
          <TitleButton label="🗕" onClick={() => onMinimize(id)} type="normal" />
          <TitleButton label={maximized ? "🗗" : "🗖"} onClick={() => onMaximize(id)} type="normal" />
          <TitleButton label="🗙" onClick={() => onClose(id)} type="close" />
        </div>
      </div>

      {/* ---- MENU BAR ---- */}
      <div style={{
        background: 'var(--xp-surface)',
        borderBottom: '1px solid #a0a0a0',
        padding: '2px 4px',
        display: 'flex',
        gap: 2,
        flexShrink: 0,
      }}>
        {['File', 'Edit', 'View', 'Help'].map((item, i) => (
          <MenuBarItem key={i} label={item} underlineIndex={0} />
        ))}
      </div>

      {/* ---- CONTENT AREA ---- */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        background: '#fff',
        borderLeft: '2px solid #8e8f8a',
        borderRight: '2px solid #fff',
        borderTop: '2px solid #8e8f8a',
        borderBottom: '2px solid #fff',
        margin: '0 2px',
      }}>
        {children}
      </div>

      {/* ---- STATUS BAR ---- */}
      <div style={{
        background: 'var(--xp-surface)',
        borderTop: '1px solid #a0a0a0',
        padding: '2px 6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11,
        color: '#555',
        flexShrink: 0,
        height: 22,
      }}>
        <span>Ready</span>
        <span style={{ borderLeft: '1px solid #a0a0a0', paddingLeft: 8 }}>
          HaritOS XP
        </span>
      </div>

      {/* ---- RESIZE HANDLES ---- */}
      {!maximized && (
        <>
          <ResizeHandle dir="e" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle dir="s" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle dir="se" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle dir="w" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle dir="n" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle dir="sw" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle dir="ne" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle dir="nw" onMouseDown={handleResizeMouseDown} />
        </>
      )}
    </div>
  )
}

function TitleButton({ label, onClick, type }) {
  const [hover, setHover] = useState(false)
  const isClose = type === 'close'
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 22,
        height: 22,
        border: `1px solid ${isClose ? 'rgba(100,0,0,0.4)' : 'rgba(0,0,80,0.3)'}`,
        borderRadius: 3,
        background: hover
          ? (isClose ? 'var(--xp-btn-close-hover)' : 'linear-gradient(180deg, #5ca0f0, #3070d8)')
          : (isClose ? 'var(--xp-btn-close)' : 'var(--xp-btn-min)'),
        color: '#fff',
        fontSize: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  )
}

function MenuBarItem({ label, underlineIndex }) {
  const [hover, setHover] = useState(false)
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '2px 6px',
        fontSize: 11,
        cursor: 'default',
        borderRadius: 2,
        background: hover ? 'var(--xp-menu-highlight)' : 'transparent',
        color: hover ? '#fff' : '#333',
      }}
    >
      {label.split('').map((ch, i) => (
        <span key={i} style={i === underlineIndex ? { textDecoration: 'underline' } : {}}>
          {ch}
        </span>
      ))}
    </span>
  )
}

const CURSOR_MAP = {
  e: 'ew-resize', w: 'ew-resize',
  n: 'ns-resize', s: 'ns-resize',
  se: 'nwse-resize', nw: 'nwse-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
}

const POS_MAP = {
  e:  { top: 0, right: -3, bottom: 0, width: 6 },
  w:  { top: 0, left: -3, bottom: 0, width: 6 },
  n:  { top: -3, left: 0, right: 0, height: 6 },
  s:  { bottom: -3, left: 0, right: 0, height: 6 },
  se: { bottom: -4, right: -4, width: 12, height: 12 },
  sw: { bottom: -4, left: -4, width: 12, height: 12 },
  ne: { top: -4, right: -4, width: 12, height: 12 },
  nw: { top: -4, left: -4, width: 12, height: 12 },
}

function ResizeHandle({ dir, onMouseDown }) {
  return (
    <div
      onMouseDown={(e) => onMouseDown(e, dir)}
      style={{
        position: 'absolute',
        cursor: CURSOR_MAP[dir],
        ...POS_MAP[dir],
        zIndex: 1,
      }}
    />
  )
}
