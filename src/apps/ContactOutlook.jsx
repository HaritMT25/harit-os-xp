import { useState } from 'react'
import { personalInfo } from '../data/resume-data'
import { ContactRow } from '../shared'

export default function ContactOutlook() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    const mailtoSubject = encodeURIComponent(subject || "Let's connect!")
    const mailtoBody = encodeURIComponent(
      `${body || "Hi Harit, I checked out your portfolio and wanted to reach out!"}\n\n— ${name || 'A visitor'}`
    )
    window.open(`mailto:${personalInfo.email}?subject=${mailtoSubject}&body=${mailtoBody}`, '_self')
    setSent(true)
  }

  const handleQuickMessage = (msg) => {
    const mailtoSubject = encodeURIComponent('👋 ' + msg)
    const mailtoBody = encodeURIComponent(`${msg}\n\nSent from HaritOS XP`)
    window.open(`mailto:${personalInfo.email}?subject=${mailtoSubject}&body=${mailtoBody}`, '_self')
    setSent(true)
  }

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button style={styles.toolBtn} onClick={handleSend}>
          📨 <span style={{ fontWeight: 700 }}>Send</span>
        </button>
        <div style={styles.toolSep} />
        <button style={styles.toolBtn} onClick={() => setSent(false)}>📝 New</button>
      </div>

      {sent ? (
        <div style={styles.sentContainer}>
          <div style={styles.sentBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#003399', marginBottom: 4 }}>
              Opening your email client...
            </div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>
              If it didn't open, you can reach me directly:
            </div>
            <div style={styles.contactList}>
              <ContactRow icon="📧" label="Email" value={personalInfo.email} href={`mailto:${personalInfo.email}`} />
              <ContactRow icon="🐙" label="GitHub" value={personalInfo.github} href={`https://${personalInfo.github}`} />
              <ContactRow icon="💼" label="LinkedIn" value={personalInfo.linkedin} href={`https://${personalInfo.linkedin}`} />
            </div>
            <button onClick={() => setSent(false)} className="xp-button" style={{ marginTop: 8 }}>✉️ Write another</button>
          </div>
        </div>
      ) : (
        <div style={styles.composeArea}>
          {/* email fields */}
          <div style={styles.field}>
            <label style={styles.fieldLabel}>To:</label>
            <div style={styles.fieldValue}>{personalInfo.email}</div>
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>From:</label>
            <input style={styles.fieldInput} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Subject:</label>
            <input style={styles.fieldInput} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Let's connect!" />
          </div>

          {/* body */}
          <div style={styles.bodyArea}>
            <textarea
              style={styles.textarea}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message here..."
            />
          </div>

          {/* quick messages bar */}
          <div style={styles.quickBar}>
            <span style={styles.quickLabel}>⚡ Quick:</span>
            <button style={styles.quickBtn} onClick={() => handleQuickMessage(`${name || 'Someone'} was here! 👋`)}>
              "{name || 'I'} was here" 👋
            </button>
            <button style={styles.quickBtn} onClick={() => handleQuickMessage("Love the XP portfolio! 🖥️")}>
              Love the portfolio! 🖥️
            </button>
            <button style={styles.quickBtn} onClick={() => handleQuickMessage("Let's chat about an opportunity")}>
              Let's chat 💼
            </button>
          </div>

          {/* contact card */}
          <div style={styles.contactBar}>
            <div style={styles.contactBarGrid}>
              <ContactRow icon="📧" label="Email" value={personalInfo.email} href={`mailto:${personalInfo.email}`} style={{ padding: '4px 0' }} />
              <ContactRow icon="💼" label="LinkedIn" value={personalInfo.linkedin} href={`https://${personalInfo.linkedin}`} style={{ padding: '4px 0' }} />
              <ContactRow icon="🐙" label="GitHub" value={personalInfo.github} href={`https://${personalInfo.github}`} style={{ padding: '4px 0' }} />
              <ContactRow icon="📍" label="Location" value={personalInfo.location} style={{ padding: '4px 0' }} />
            </div>
            <div style={styles.availBadge}>
              <span style={styles.availDot} />
              Open to SDE, ML & Co-op opportunities
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Tahoma', sans-serif", fontSize: 11, background: '#fff' },
  toolbar: { background: 'var(--xp-surface)', borderBottom: '1px solid #a0a0a0', padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 },
  toolBtn: { padding: '3px 10px', border: '1px solid transparent', borderRadius: 3, background: 'transparent', cursor: 'pointer', fontSize: 11, fontFamily: "'Tahoma', sans-serif", display: 'flex', alignItems: 'center', gap: 4 },
  toolSep: { width: 1, height: 22, background: '#c0c0c0', margin: '0 4px' },
  composeArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  field: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', flexShrink: 0 },
  fieldLabel: { width: 60, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#333', background: '#f8f8f8', borderRight: '1px solid #e0e0e0' },
  fieldValue: { flex: 1, padding: '6px 10px', fontSize: 11, color: '#333' },
  fieldInput: { flex: 1, padding: '6px 10px', fontSize: 11, border: 'none', outline: 'none', fontFamily: "'Tahoma', sans-serif" },
  bodyArea: { flex: 1, overflow: 'hidden' },
  textarea: { width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none', padding: '10px 12px', fontSize: 12, fontFamily: "'Tahoma', sans-serif", lineHeight: 1.6 },
  quickBar: { padding: '6px 10px', background: '#f0f8ff', borderTop: '1px solid #d0e0f0', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, flexWrap: 'wrap' },
  quickLabel: { fontSize: 10, color: '#666', flexShrink: 0 },
  quickBtn: { padding: '3px 8px', border: '1px solid #b0c4de', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 10, fontFamily: "'Tahoma', sans-serif", color: '#0078d7', whiteSpace: 'nowrap' },
  contactBar: { background: '#f5f8fc', borderTop: '1px solid #d0d0d0', padding: 10, flexShrink: 0 },
  contactBarGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' },
  availBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', marginTop: 6, background: '#e8f5e9', borderRadius: 3, fontSize: 10, color: '#2e7d32', fontWeight: 600 },
  availDot: { width: 8, height: 8, borderRadius: '50%', background: '#4caf50', flexShrink: 0 },
  sentContainer: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f8fc' },
  sentBox: { textAlign: 'center', padding: 24 },
  contactList: { display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left', maxWidth: 280, margin: '0 auto 8px' },
}
