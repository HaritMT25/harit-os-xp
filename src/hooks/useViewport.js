import { useState, useEffect } from 'react'

// ─── Viewport Utilities ──────────────────────────────────
// Single source of truth for shell layout constants and
// viewport-aware sizing. Mobile browsers resize the visible
// viewport as the URL bar collapses and the keyboard opens,
// so anything full-screen must use dvh (with a vh fallback)
// or re-clamp on resize.

export const TASKBAR_HEIGHT = 38
export const MOBILE_BREAKPOINT = 768

const supportsDvh =
  typeof CSS !== 'undefined' && CSS.supports?.('height', '100dvh')

// full visible viewport height
export const FULL_HEIGHT = supportsDvh ? '100dvh' : '100vh'

// desktop area above the taskbar — used by maximized windows
export const DESKTOP_HEIGHT = supportsDvh
  ? `calc(100dvh - ${TASKBAR_HEIGHT}px)`
  : `calc(100vh - ${TASKBAR_HEIGHT}px)`

export const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT

export const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(pointer: coarse)').matches

// A phone-sized screen in either orientation: narrow, or a touch screen
// whose short side is phone-sized (a phone held sideways can be ~900px wide).
export const isPhoneViewport = (w, h) =>
  w < MOBILE_BREAKPOINT || (isCoarsePointer() && Math.min(w, h) < 600)

// Fit a window's position/size into the current viewport:
// shrink oversized windows, pull off-screen windows back in.
export function fitToViewport(position, size, margin = 8) {
  const availW = window.innerWidth
  const availH = window.innerHeight - TASKBAR_HEIGHT
  const w = Math.min(size.w, availW - margin * 2)
  const h = Math.min(size.h, availH - margin * 2)
  const x = Math.max(margin, Math.min(position.x, availW - w - margin))
  const y = Math.max(margin, Math.min(position.y, availH - h - margin))
  return { position: { x, y }, size: { w, h } }
}

// Live viewport size, debounced — drives responsive relayout
// of the taskbar and desktop icons on resize/rotation.
export function useViewportSize(delay = 150) {
  const [vp, setVp] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }))

  useEffect(() => {
    let timer
    const update = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setVp({ w: window.innerWidth, h: window.innerHeight })
      }, delay)
    }
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [delay])

  return vp
}
