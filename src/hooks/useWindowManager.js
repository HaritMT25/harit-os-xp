import { useState, useCallback } from 'react'

const INITIAL_POSITIONS = {
  about:    { x: 80,  y: 50 },
  resume:   { x: 120, y: 70 },
  projects: { x: 160, y: 40 },
  skills:   { x: 100, y: 90 },
  contact:  { x: 200, y: 60 },
  terminal: { x: 140, y: 80 },
  ie:       { x: 60,  y: 30 },
  notepad:  { x: 180, y: 50 },
  minesweeper: { x: 220, y: 60 },
  ai:          { x: 100, y: 40 },
}

const WINDOW_SIZES = {
  about:    { w: 520, h: 440 },
  resume:   { w: 600, h: 520 },
  projects: { w: 680, h: 520 },
  skills:   { w: 500, h: 440 },
  contact:  { w: 460, h: 380 },
  terminal: { w: 580, h: 400 },
  ie:       { w: 880, h: 620 },
  notepad:  { w: 480, h: 400 },
  minesweeper: { w: 300, h: 380 },
  ai:       { w: 420, h: 500 },
  visitor:  { w: 560, h: 420 },
}

export function useWindowManager() {
  const [windows, setWindows] = useState({})
  // windowOrder tracks z-index stacking: last = topmost
  const [windowOrder, setWindowOrder] = useState([])

  const openWindow = useCallback((id) => {
    setWindows(prev => {
      if (prev[id]) {
        // Already open — just unminimize and focus
        return {
          ...prev,
          [id]: { ...prev[id], minimized: false },
        }
      }
      // New window
      return {
        ...prev,
        [id]: {
          id,
          position: { ...INITIAL_POSITIONS[id] },
          size: { ...WINDOW_SIZES[id] },
          minimized: false,
          maximized: false,
          closing: false,
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
            position: win.prevPosition || INITIAL_POSITIONS[id],
            size: win.prevSize || WINDOW_SIZES[id],
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
