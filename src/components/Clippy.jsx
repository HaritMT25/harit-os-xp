import { useState, useEffect } from 'react'

export default function Clippy({ onOpenWindow, delay = 12000 }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [message, setMessage] = useState(0)

  const MESSAGES = [
    {
      text: "It looks like you're hiring! Would you like help finding a qualified candidate?",
      actions: [
        { label: '📄 Show me the resume', action: () => onOpenWindow('resume') },
        { label: '🚫 Go away forever', action: () => setDismissed(true) },
      ],
    },
    {
      text: "Have you tried HaritBot yet? It's an AI assistant that knows everything about this portfolio. Ask it why you should hire Harit. Go on, I dare you.",
      actions: [
        { label: '🤖 Open HaritBot', action: () => onOpenWindow('ai') },
        { label: '🙄 Dismiss', action: () => setDismissed(true) },
      ],
    },
    {
      text: "Pro tip: Try typing 'neofetch' in the Terminal. You won't regret it.",
      actions: [
        { label: '💻 Open Terminal', action: () => onOpenWindow('terminal') },
        { label: '✖ Close', action: () => setDismissed(true) },
      ],
    },
  ]

  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay, dismissed])

  // Cycle through messages if they dismiss and come back
  const handleAction = (actionFn) => {
    actionFn()
    setVisible(false)
    // Show next message after a while
    if (message < MESSAGES.length - 1) {
      setTimeout(() => {
        setMessage(prev => prev + 1)
        setVisible(true)
      }, 30000)
    }
  }

  if (dismissed || !visible) return null

  const msg = MESSAGES[message]

  return (
    <div style={styles.container}>
      {/* Speech bubble */}
      <div style={styles.bubble}>
        <button
          onClick={() => { setVisible(false); setDismissed(true) }}
          style={styles.bubbleClose}
        >✕</button>
        <p style={styles.bubbleText}>{msg.text}</p>
        <div style={styles.bubbleActions}>
          {msg.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleAction(action.action)}
              style={styles.actionBtn}
            >
              {action.label}
            </button>
          ))}
        </div>
        {/* Bubble tail */}
        <div style={styles.bubbleTail} />
      </div>

      {/* Clippy character (CSS paperclip) */}
      <div style={styles.clippy}>
        <div style={styles.clippyBody}>
          <div style={styles.clippyEyeL}>
            <div style={styles.clippyPupil} />
          </div>
          <div style={styles.clippyEyeR}>
            <div style={styles.clippyPupil} />
          </div>
          <div style={styles.clippyBrow} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 48,
    right: 16,
    zIndex: 9990,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    animation: 'slideUp 0.4s ease-out',
  },
  bubble: {
    background: '#ffffe1',
    border: '2px solid #444',
    borderRadius: 12,
    padding: '12px 14px',
    maxWidth: 260,
    boxShadow: '2px 4px 12px rgba(0,0,0,0.25)',
    position: 'relative',
    marginBottom: 8,
    fontFamily: "'Tahoma', sans-serif",
  },
  bubbleClose: {
    position: 'absolute',
    top: 4,
    right: 6,
    background: 'none',
    border: 'none',
    fontSize: 12,
    cursor: 'pointer',
    color: '#888',
    fontWeight: 700,
  },
  bubbleText: {
    margin: '0 0 10px',
    fontSize: 12,
    lineHeight: 1.5,
    color: '#333',
    paddingRight: 12,
  },
  bubbleActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  actionBtn: {
    padding: '4px 10px',
    border: '1px solid #999',
    borderRadius: 3,
    background: 'linear-gradient(180deg, #fff, #f0f0e0)',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: "'Tahoma', sans-serif",
    textAlign: 'left',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -10,
    right: 24,
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '10px solid #444',
  },

  // Clippy character — stylized paperclip with eyes
  clippy: {
    width: 50,
    height: 60,
    position: 'relative',
    animation: 'clippyBounce 2s ease-in-out infinite',
  },
  clippyBody: {
    width: 36,
    height: 50,
    border: '4px solid #666',
    borderRadius: '16px 16px 4px 16px',
    background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #a0a0a0)',
    position: 'relative',
    margin: '0 auto',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
  },
  clippyEyeL: {
    position: 'absolute',
    top: 12,
    left: 5,
    width: 10,
    height: 12,
    background: '#fff',
    borderRadius: '50%',
    border: '1px solid #555',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clippyEyeR: {
    position: 'absolute',
    top: 12,
    right: 5,
    width: 10,
    height: 12,
    background: '#fff',
    borderRadius: '50%',
    border: '1px solid #555',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clippyPupil: {
    width: 5,
    height: 5,
    background: '#333',
    borderRadius: '50%',
    animation: 'clippyLook 3s ease-in-out infinite',
  },
  clippyBrow: {
    position: 'absolute',
    top: 8,
    left: 6,
    width: 22,
    height: 3,
    background: '#666',
    borderRadius: 2,
  },
}

