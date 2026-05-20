import { useState } from 'react'
import { personalInfo } from '../data/resume-data'

export default function LandingPage({ onChoose }) {
  const [hover, setHover] = useState(null)
  const [entering, setEntering] = useState(false)

  const handleChoose = (mode) => {
    setEntering(true)
    setTimeout(() => onChoose(mode), 600)
  }

  return (
    <div style={{
      ...styles.container,
      opacity: entering ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Background */}
      <div style={styles.bg}>
        <div style={styles.bgGrad} />
        <div style={styles.noise} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoFlag}>
            <div style={{ ...styles.flagQ, background: '#ff3e3e' }} />
            <div style={{ ...styles.flagQ, background: '#00a651' }} />
            <div style={{ ...styles.flagQ, background: '#0078d7' }} />
            <div style={{ ...styles.flagQ, background: '#ffb900' }} />
          </div>
          <h1 style={styles.logo}>
            <span style={styles.logoName}>Harit</span>
            <span style={styles.logoDot}>.</span>
          </h1>
          <p style={styles.subtitle}>Software Engineer & ML Researcher</p>
          <p style={styles.subSubtitle}>MS Computer Science · Northeastern University</p>
        </div>

        {/* Choice cards */}
        <div style={styles.cards}>
          {/* Quick Portfolio */}
          <div
            onClick={() => handleChoose('quick')}
            onMouseEnter={() => setHover('quick')}
            onMouseLeave={() => setHover(null)}
            style={{
              ...styles.card,
              borderColor: hover === 'quick' ? '#0078d7' : 'rgba(255,255,255,0.15)',
              transform: hover === 'quick' ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
              boxShadow: hover === 'quick'
                ? '0 12px 40px rgba(0, 120, 215, 0.3)'
                : '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <div style={styles.cardIcon}>⚡</div>
            <h2 style={styles.cardTitle}>Quick View</h2>
            <p style={styles.cardDesc}>
              Clean, modern portfolio. See my experience, projects, and skills at a glance.
            </p>
            <div style={styles.cardMeta}>~30 seconds</div>
          </div>

          {/* XP Experience */}
          <div
            onClick={() => handleChoose('xp')}
            onMouseEnter={() => setHover('xp')}
            onMouseLeave={() => setHover(null)}
            style={{
              ...styles.card,
              borderColor: hover === 'xp' ? '#00a651' : 'rgba(255,255,255,0.15)',
              transform: hover === 'xp' ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
              boxShadow: hover === 'xp'
                ? '0 12px 40px rgba(0, 166, 81, 0.3)'
                : '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <div style={styles.cardIcon}>🖥️</div>
            <h2 style={styles.cardTitle}>Full Experience</h2>
            <p style={styles.cardDesc}>
              Interactive Windows XP desktop. Explore apps, browse projects, use the terminal.
            </p>
            <div style={styles.cardMeta}>~5 minutes</div>
            {typeof window !== 'undefined' && window.innerWidth < 768 && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                Best on desktop · works on mobile
              </div>
            )}
          </div>
        </div>

        {/* Footer links */}
        <div style={styles.footer}>
          <a href={`mailto:${personalInfo.email}`} style={styles.footerLink}>📧 Email</a>
          <span style={styles.footerDot}>·</span>
          <a href={`https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" style={styles.footerLink}>🐙 GitHub</a>
          <span style={styles.footerDot}>·</span>
          <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" style={styles.footerLink}>💼 LinkedIn</a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', 'Tahoma', sans-serif",
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
  },
  bgGrad: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 30%, #0d1b2a 60%, #1b2838 100%)',
  },
  noise: {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
  },

  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '24px',
    maxWidth: 700,
    width: '100%',
    animation: 'fadeIn 0.8s ease-out',
  },

  logoArea: {
    marginBottom: 40,
  },
  logoFlag: {
    display: 'inline-grid',
    gridTemplateColumns: '1fr 1fr',
    width: 36,
    height: 36,
    gap: 2,
    marginBottom: 16,
    transform: 'rotate(-5deg)',
    opacity: 0.8,
  },
  flagQ: {
    borderRadius: 2,
  },
  logo: {
    margin: 0,
    fontSize: 52,
    fontWeight: 300,
    letterSpacing: -2,
    color: '#fff',
  },
  logoName: {
    fontWeight: 700,
  },
  logoDot: {
    color: '#0078d7',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    margin: '8px 0 0',
    fontWeight: 300,
    letterSpacing: 0.5,
  },
  subSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    margin: '4px 0 0',
    fontWeight: 400,
  },

  cards: {
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  card: {
    width: 260,
    padding: '32px 24px',
    borderRadius: 12,
    border: '1px solid',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
  },
  cardDesc: {
    margin: '0 0 12px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
  },
  cardMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: 13,
    transition: 'color 0.15s',
  },
  footerDot: {
    color: 'rgba(255,255,255,0.2)',
  },
}
