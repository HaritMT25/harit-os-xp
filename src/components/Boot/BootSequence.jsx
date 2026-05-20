import { useState, useEffect } from 'react'

const PHASES = {
  BIOS: 0,
  LOADING: 1,
  WELCOME: 2,
  DONE: 3,
}

const BIOS_LINES = [
  'HaritBIOS v4.2.0 — Harit Systems Inc.',
  'Copyright (C) 2023-2026 Harit Corp.',
  '',
  'CPU: Neural Processing Unit @ ∞ GHz',
  'Memory Testing: 16384 MB OK',
  'Detecting IDE drives...',
  '  Primary Master: HaritOS-SSD 2TB',
  '  Primary Slave:  Projects Archive',
  '',
  'Loading HaritOS XP Professional...',
]

export default function BootSequence({ onComplete }) {
  const [phase, setPhase] = useState(PHASES.BIOS)
  const [biosLine, setBiosLine] = useState(0)
  const [progress, setProgress] = useState(0)

  // BIOS text reveal
  useEffect(() => {
    if (phase !== PHASES.BIOS) return
    if (biosLine >= BIOS_LINES.length) {
      setTimeout(() => setPhase(PHASES.LOADING), 400)
      return
    }
    const delay = BIOS_LINES[biosLine] === '' ? 100 : 80 + Math.random() * 60
    const timer = setTimeout(() => setBiosLine(prev => prev + 1), delay)
    return () => clearTimeout(timer)
  }, [phase, biosLine])

  // Loading progress bar
  useEffect(() => {
    if (phase !== PHASES.LOADING) return
    if (progress >= 100) {
      setTimeout(() => setPhase(PHASES.WELCOME), 300)
      return
    }
    const increment = Math.random() * 8 + 2
    const delay = 30 + Math.random() * 40
    const timer = setTimeout(() => setProgress(prev => Math.min(prev + increment, 100)), delay)
    return () => clearTimeout(timer)
  }, [phase, progress])

  // Welcome screen
  useEffect(() => {
    if (phase !== PHASES.WELCOME) return
    const timer = setTimeout(() => {
      setPhase(PHASES.DONE)
      onComplete()
    }, 1800)
    return () => clearTimeout(timer)
  }, [phase, onComplete])

  if (phase === PHASES.DONE) return null

  return (
    <div style={styles.container}>
      {/* CRT scanline overlay */}
      <div style={styles.scanlines} />

      {phase === PHASES.BIOS && (
        <div style={styles.biosScreen}>
          {BIOS_LINES.slice(0, biosLine).map((line, i) => (
            <div key={i} style={styles.biosLine}>
              {line || '\u00A0'}
            </div>
          ))}
          {biosLine < BIOS_LINES.length && (
            <span style={styles.cursor}>▮</span>
          )}
        </div>
      )}

      {phase === PHASES.LOADING && (
        <div style={styles.loadingScreen}>
          {/* Logo */}
          <div style={styles.logoContainer}>
            <div style={styles.logoFlag}>
              <div style={{ ...styles.flagQuad, background: '#ff3e3e' }} />
              <div style={{ ...styles.flagQuad, background: '#00a651' }} />
              <div style={{ ...styles.flagQuad, background: '#0078d7' }} />
              <div style={{ ...styles.flagQuad, background: '#ffb900' }} />
            </div>
            <div style={styles.logoText}>
              <span style={styles.logoHarit}>Harit</span>
              <span style={styles.logoOS}>OS</span>
              <span style={styles.logoXP}> XP</span>
            </div>
            <div style={styles.edition}>Professional</div>
          </div>

          {/* Loading bar */}
          <div style={styles.loadingBarContainer}>
            <div style={styles.loadingBarTrack}>
              <div style={{ ...styles.loadingBarFill, width: `${progress}%` }}>
                {/* Animated segments */}
                <div style={styles.loadingBarShine} />
              </div>
            </div>
          </div>

          {/* Animated dots */}
          <div style={styles.dotsContainer}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                ...styles.dot,
                animationDelay: `${i * 0.3}s`,
              }} />
            ))}
          </div>
        </div>
      )}

      {phase === PHASES.WELCOME && (
        <div style={styles.welcomeScreen}>
          <div style={styles.welcomeGradient}>
            <div style={styles.welcomeContent}>
              <div style={styles.welcomeText}>Welcome</div>
              <div style={styles.welcomeLoading}>
                <div style={styles.welcomeSpinner} />
                <span style={styles.welcomeSubtext}>Loading your personal settings...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    background: '#000',
    zIndex: 99999,
    overflow: 'hidden',
  },
  scanlines: {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
    pointerEvents: 'none',
    zIndex: 1,
  },

  // BIOS
  biosScreen: {
    padding: 32,
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: '#aaa',
    lineHeight: 1.6,
    animation: 'fadeIn 0.2s',
  },
  biosLine: {
    whiteSpace: 'pre',
  },
  cursor: {
    color: '#aaa',
    animation: 'blink 0.8s step-end infinite',
  },

  // LOADING
  loadingScreen: {
    position: 'absolute',
    inset: 0,
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.5s',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: 48,
  },
  logoFlag: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: 52,
    height: 52,
    gap: 3,
    margin: '0 auto 16px',
    transform: 'rotate(-5deg)',
  },
  flagQuad: {
    borderRadius: 3,
  },
  logoText: {
    fontSize: 36,
    fontFamily: "'Trebuchet MS', 'Franklin Gothic Medium', sans-serif",
    fontWeight: 700,
    letterSpacing: -1,
  },
  logoHarit: { color: '#fff' },
  logoOS: { color: '#ff8c00' },
  logoXP: { color: '#4fc3f7', fontWeight: 400, fontStyle: 'italic' },
  edition: {
    color: '#777',
    fontSize: 12,
    fontFamily: "'Trebuchet MS', sans-serif",
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  loadingBarContainer: {
    width: 220,
    marginBottom: 24,
  },
  loadingBarTrack: {
    width: '100%',
    height: 18,
    background: '#1a1a2e',
    borderRadius: 9,
    overflow: 'hidden',
    border: '1px solid #333',
    padding: 2,
  },
  loadingBarFill: {
    height: '100%',
    background: 'linear-gradient(180deg, #5ba3f7, #2567d4, #1a56b8)',
    borderRadius: 7,
    transition: 'width 0.1s linear',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)',
    borderRadius: '7px 7px 0 0',
  },

  dotsContainer: {
    display: 'flex',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#4fc3f7',
    animation: 'pulse 1.2s ease-in-out infinite',
  },

  // WELCOME
  welcomeScreen: {
    position: 'absolute',
    inset: 0,
    animation: 'fadeIn 0.6s',
  },
  welcomeGradient: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #0050a0 0%, #003580 30%, #002060 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContent: {
    textAlign: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 48,
    fontFamily: "'Trebuchet MS', sans-serif",
    fontWeight: 300,
    letterSpacing: 2,
    marginBottom: 24,
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  welcomeLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  welcomeSpinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  welcomeSubtext: {
    color: '#b0d4ff',
    fontSize: 13,
    fontFamily: "'Tahoma', sans-serif",
  },
}

