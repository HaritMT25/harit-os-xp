import { useState, useCallback } from 'react'
import { getWindowDefaults } from '../data/app-registry'

export function useWindowManager() {
  const [windows, setWindows] = useState({})
  // windowOrder tracks z-index stacking: last = topmost
  const [windowOrder, setWindowOrder] = useState([])

  const openWindow = useCallback((id) => {
    const isMobile = window.innerWidth < 768
    setWindows(prev => {
      if (prev[id]) {
        // Already open — just unminimize and focus
        return {
          ...prev,
          [id]: { ...prev[id], minimized: false },
        }
      }
      // New window — auto-maximize on mobile
      const { position: defaultPos, size: defaultSize } = getWindowDefaults(id)
      return {
        ...prev,
        [id]: {
          id,
          position: isMobile ? { x: 0, y: 0 } : defaultPos,
          size: isMobile ? { w: window.innerWidth, h: window.innerHeight - 38 } : defaultSize,
          minimized: false,
          maximized: isMobile,
          closing: false,
          ...(isMobile && { prevPosition: defaultPos, prevSize: defaultSize }),
        },
      }
    })
    setWindowOrder(prev => [...prev.filter(w => w !== id), id])
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
      return {
        ...prev,
        [id]: {
          ...win,
          maximized: true,
          prevPosition: { ...win.position },
          prevSize: { ...win.size },
          position: { x: 0, y: 0 },
          size: { w: window.innerWidth, h: window.innerHeight - 38 },
        },
      }
    })
    focusWindow(id)
  }, [focusWindow])

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
    toggleMaximize,
    moveWindow,
    resizeWindow,
    taskbarClick,
    getZIndex,
    isTopWindow,
  }
}