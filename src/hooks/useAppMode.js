import { useState, useCallback, useEffect } from 'react'

const MODE_KEY = 'haritos_mode'
const WELCOME_KEY = 'haritos_show_welcome'

// storage access can throw in some private-browsing modes — best-effort
export const welcomePref = () => {
  try { return localStorage.getItem(WELCOME_KEY) !== 'false' } catch { return true }
}
export const setWelcomePref = (value) => {
  try { localStorage.setItem(WELCOME_KEY, String(value)) } catch { /* best-effort */ }
}

function getInitialMode() {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'quick') return 'quick'
  if (hash === 'xp') return 'booting'
  // a refresh restores the last mode directly (no boot replay)
  try {
    const saved = sessionStorage.getItem(MODE_KEY)
    if (saved === 'xp' || saved === 'quick') return saved
  } catch { /* best-effort */ }
  return 'landing'
}

export function useAppMode() {
  const [mode, setMode] = useState(getInitialMode)
  const [showWelcome, setShowWelcome] = useState(welcomePref)

  // Clean the hash from the URL after mount — safe side effect
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  // Persist the current mode so a refresh doesn't dump users to landing
  useEffect(() => {
    try {
      if (mode === 'xp' || mode === 'quick') sessionStorage.setItem(MODE_KEY, mode)
      else if (mode === 'landing') sessionStorage.removeItem(MODE_KEY)
    } catch { /* best-effort */ }
  }, [mode])

  // Prefetch XP chunks while user is on landing page
  useEffect(() => {
    if (mode === 'landing') {
      const timer = setTimeout(() => {
        import('../components/Boot/BootSequence')
        import('../components/Desktop/Desktop')
        import('../components/Window/Window')
        import('../components/Taskbar/Taskbar')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [mode])

  const navigate = useCallback((target) => {
    if (target === 'xp' || target === 'booting') {
      setMode('booting')
      setShowWelcome(welcomePref())
    } else if (target === 'shutdown') {
      setMode('shutting-down')
    } else {
      setMode(target)
    }
  }, [])

  return { mode, setMode, showWelcome, setShowWelcome, navigate }
}