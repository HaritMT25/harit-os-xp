import { useState, useCallback, useEffect } from 'react'
import { getWindowDefaults } from '../data/app-registry'
import { isMobileViewport, fitToViewport } from './useViewport'

export function useWindowManager() {
  const [windows, setWindows] = useState({})
  // windowOrder tracks z-index stacking: last = topmost
  const [windowOrder, setWindowOrder] = useState([])

  const openWindow = useCallback((id) => {
    const isMobile = isMobileViewport()
    setWindows(prev => {
      if (prev[id]) {
        // Already open — just unminimize and focus
        return {
          ...prev,
          [id]: { ...prev[id], minimized: false },
        }
      }
      // New window — auto-maximize on mobile, fit to viewport elsewhere
      // (registry defaults can exceed small laptop/tablet screens)
      const { position: defaultPos, size: defaultSize } = getWindowDefaults(id)
      const fitted = fitToViewport(defaultPos, defaultSize)
      return {
        ...prev,
        [id]: {
          id,
          position: fitted.position,
          size: fitted.size,
          minimized: false,
          maximized: isMobile,
          closing: false,
          ...(isMobile && { prevPosition: fitted.position, prevSize: fitted.size }),
        },
      }
    })
    setWindowOrder(prev => [...prev.filter(w => w !== id), id])
  }, [])

  // Keep non-maximized windows on screen when the viewport shrinks
  // (rotation, browser resize). Maximized windows track the viewport
  // via CSS, so they need no correction here.
  useEffect(() => {
    let timer
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setWindows(prev => {
          let changed = false
          const next = { ...prev }
          for (const id of Object.keys(next)) {
            const win = next[id]
            if (win.maximized) continue
            const fitted = fitToViewport(win.position, win.size)
            if (
              fitted.position.x !== win.position.x ||
              fitted.position.y !== win.position.y ||
              fitted.size.w !== win.size.w ||
              fitted.size.h !== win.size.h
            ) {
              next[id] = { ...win, position: fitted.position, size: fitted.size }
              changed = true
            }
          }
          return changed ? next : prev
        })
      }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const closeWindow = useCallback((id) => {
    // Trigger close animation
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], closing: true },
    }))
    // Remove after animation
    setTimeout(() => {
      setWindows(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setWindowOrder(prev => prev.filter(w => w !== id))
    }, 150)
  }, [])

  const focusWindow = useCallback((id) => {
    setWindowOrder(prev => [...prev.filter(w => w !== id), id])
  }, [])

  const minimizeWindow = useCallback((id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], minimized: true },
    }))
  }, [])

  const toggleMaximize = useCallback((id) => {
    setWindows(prev => {
      const win = prev[id]
      if (win.maximized) {
        return {
          ...prev,
          [id]: {
            ...win,
            maximized: false,
            position: win.prevPosition || getWindowDefaults(id).position,
            size: win.prevSize || getWindowDefaults(id).size,
          },
        }
      }
      // maximized geometry is CSS-driven (tracks the live viewport),
      // so only the restore snapshot is stored here
      return {
        ...prev,
        [id]: {
          ...win,
          maximized: true,
          prevPosition: { ...win.position },
          prevSize: { ...win.size },
        },
      }
    })
    focusWindow(id)
  }, [focusWindow])

  const minimizeAll = useCallback(() => {
    setWindows(prev => {
      const next = {}
      for (const [id, win] of Object.entries(prev)) {
        next[id] = { ...win, minimized: true }
      }
      return next
    })
  }, [])

  const moveWindow = useCallback((id, position) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], position },
    }))
  }, [])

  const resizeWindow = useCallback((id, size) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], size },
    }))
  }, [])

  const taskbarClick = useCallback((id) => {
    const win = windows[id]
    if (!win) return
    if (win.minimized) {
      openWindow(id)
    } else if (windowOrder[windowOrder.length - 1] === id) {
      minimizeWindow(id)
    } else {
      focusWindow(id)
    }
  }, [windows, windowOrder, openWindow, minimizeWindow, focusWindow])

  const getZIndex = useCallback((id) => {
    return 100 + windowOrder.indexOf(id)
  }, [windowOrder])

  const isTopWindow = useCallback((id) => {
    return windowOrder[windowOrder.length - 1] === id
  }, [windowOrder])

  return {
    windows,
    windowOrder,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    minimizeAll,
    toggleMaximize,
    moveWindow,
    resizeWindow,
    taskbarClick,
    getZIndex,
    isTopWindow,
  }
}