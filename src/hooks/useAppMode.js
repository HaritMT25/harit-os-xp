import { useState, useCallback, useEffect } from 'react'

function getInitialMode() {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'quick') return 'quick'
  if (hash === 'xp') return 'booting'
  return 'landing'
}

export function useAppMode() {
  const [mode, setMode] = useState(getInitialMode)
  const [showWelcome, setShowWelcome] = useState(true)

  // Clean the hash from the URL after mount — safe side effect
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

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
      setShowWelcome(true)
    } else if (target === 'shutdown') {
      setMode('shutting-down')
    } else {
      setMode(target)
    }
  }, [])

  return { mode, setMode, showWelcome, setShowWelcome, navigate }
}