import { useCallback } from 'react'

// sound system — drop mp3s in /public/sounds/ (startup, click, close, etc.)
// degrades gracefully if files missing

const SOUNDS = {
  startup:  '/sounds/startup.mp3',
  click:    '/sounds/click.mp3',
  error:    '/sounds/error.mp3',
  notify:   '/sounds/notify.mp3',
  minimize: '/sounds/minimize.mp3',
  maximize: '/sounds/maximize.mp3',
  close:    '/sounds/close.mp3',
  logoff:   '/sounds/logoff.mp3',
}

export function useSounds() {
  const play = useCallback((soundName) => {
    const src = SOUNDS[soundName]
    if (!src) return

    try {
      // Create a new audio instance each time for overlapping sounds
      const audio = new Audio(src)
      audio.volume = 0.3
      audio.play().catch(() => {
        // Silently fail if sound file missing or autoplay blocked
      })
    } catch {
      // Sound system is best-effort
    }
  }, [])

  return { play }
}
