import { useState } from 'react'

const DEFAULT_TEXT = `notes to self
=============

- voice conversion pipeline works over phone now, need to test latency on cheaper gpus
- roboxers vel tracking still off (~1.4-1.85 error), might be alive reward dominating gradient
- should probably update sridarshan API docs before i forget again

things to look into:
- figure 02 helix balance controller — can we replicate with omnih2o?
- seed-vc + rvc hybrid serving architecture for real-time
- that one neetcode pattern i keep forgetting (monotonic stack)

if you're reading this, you found the notepad.
feel free to type whatever you want here — it's your scratchpad now.

- H
`

export default function Notepad() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [wordWrap, setWordWrap] = useState(true)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const lineCount = text.split('\n').length

  return (
    <div style={styles.container}>
      {/* Notepad menu */}
      <div style={styles.menuBar}>
        <span style={styles.menuItem}>File</span>
        <span style={styles.menuItem}>Edit</span>
        <span
          style={styles.menuItem}
          onClick={() => setWordWrap(!wordWrap)}
          title="Toggle word wrap"
        >
          Format
        </span>
        <span style={styles.menuItem}>View</span>
        <span style={styles.menuItem}>Help</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          ...styles.textarea,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowX: wordWrap ? 'hidden' : 'auto',
        }}
        spellCheck={false}
      />
      <div style={styles.statusBar}>
        <span>Ln {lineCount}, Col 1</span>
        <span>{wordCount} words</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Tahoma', sans-serif",
    background: '#fff',
  },
  menuBar: {
    background: 'var(--xp-surface)',
    borderBottom: '1px solid #a0a0a0',
    padding: '2px 4px',
    display: 'flex',
    gap: 2,
    flexShrink: 0,
  },
  menuItem: {
    padding: '2px 6px',
    fontSize: 11,
    cursor: 'default',
    borderRadius: 2,
  },
  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    padding: '8px 10px',
    fontFamily: "'Lucida Console', 'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.5,
    color: '#000',
    background: '#fff',
    tabSize: 4,
  },
  statusBar: {
    background: 'var(--xp-surface)',
    borderTop: '1px solid #a0a0a0',
    padding: '2px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#555',
    flexShrink: 0,
  },
}
