// ─── Drag Utility ────────────────────────────────────────
// Shared pointer-tracking logic for Desktop icons, Window
// title bar dragging, and Window resize handles.
//
// Usage:
//   onMouseDown={(e) => startDrag(e, {
//     onMove(x, y, startX, startY) { ... },
//     onEnd({ moved }) { ... },
//   })}
//
// Options:
//   onMove(x, y, startX, startY) — every pointer move after threshold
//   onEnd({ moved })             — pointer released
//   threshold (default 0)        — px of movement before onMove fires
//   touch (default true)         — also track touch events

function getPointer(e) {
  if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  return { x: e.clientX, y: e.clientY }
}

export function startDrag(e, { onMove, onEnd, threshold = 0, touch = true } = {}) {
  const start = getPointer(e)
  let moved = false

  const handleMove = (ev) => {
    const pt = getPointer(ev)
    if (!moved) {
      if (Math.abs(pt.x - start.x) <= threshold && Math.abs(pt.y - start.y) <= threshold) return
      moved = true
    }
    onMove?.(pt.x, pt.y, start.x, start.y)
  }

  const handleUp = () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
    if (touch) {
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleUp)
    }
    onEnd?.({ moved })
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
  if (touch) {
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleUp)
  }
}
