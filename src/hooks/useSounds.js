import { useCallback } from 'react'

// ─── Web Audio sound system ──────────────────────────────
// Every chime is synthesized at runtime — no audio files, and all
// melodies are original (no Microsoft sounds). Best-effort: silently
// no-ops if Web Audio is unavailable or blocked by autoplay policy.

let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// The context must be created during a user gesture or the browser
// keeps it suspended. The first click/tap/keypress anywhere unlocks it,
// so the boot-complete startup chime (outside a gesture) can play.
if (typeof window !== 'undefined') {
  const unlock = () => getCtx()
  window.addEventListener('pointerdown', unlock, { once: true, capture: true })
  window.addEventListener('keydown', unlock, { once: true, capture: true })
}

// one note: optional pitch sweep + quick attack/decay envelope
function tone(ac, { freq, to = freq, type = 'sine', at = 0, dur = 0.15, vol = 0.05 }) {
  const t0 = ac.currentTime + at
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

const SOUNDS = {
  click:    ac => tone(ac, { freq: 2200, type: 'square', dur: 0.03, vol: 0.015 }),
  minimize: ac => tone(ac, { freq: 700, to: 350, dur: 0.12, vol: 0.04 }),
  maximize: ac => tone(ac, { freq: 350, to: 700, dur: 0.12, vol: 0.04 }),
  close:    ac => {
    tone(ac, { freq: 520, dur: 0.07, vol: 0.04 })
    tone(ac, { freq: 340, at: 0.07, dur: 0.1, vol: 0.04 })
  },
  error:    ac => {
    tone(ac, { freq: 220, type: 'square', dur: 0.18, vol: 0.03 })
    tone(ac, { freq: 165, type: 'square', at: 0.02, dur: 0.18, vol: 0.02 })
  },
  notify:   ac => {
    tone(ac, { freq: 660, dur: 0.09, vol: 0.05 })
    tone(ac, { freq: 880, at: 0.1, dur: 0.16, vol: 0.05 })
  },
  // original four-note rising motif — a nod to boot chimes, not a copy
  startup:  ac => {
    const notes = [[392, 0, 0.22], [523.25, 0.14, 0.22], [659.25, 0.28, 0.22], [783.99, 0.42, 0.6]]
    notes.forEach(([freq, at, dur]) => tone(ac, { freq, at, dur, vol: 0.05 }))
  },
  logoff:   ac => {
    const notes = [[659.25, 0, 0.2], [523.25, 0.16, 0.2], [392, 0.32, 0.5]]
    notes.forEach(([freq, at, dur]) => tone(ac, { freq, at, dur, vol: 0.05 }))
  },
}

export function useSounds() {
  const play = useCallback((name) => {
    try {
      const ac = getCtx()
      const sound = SOUNDS[name]
      if (!ac || !sound) return
      sound(ac)
    } catch {
      // sound is best-effort
    }
  }, [])

  return { play }
}
