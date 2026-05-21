import { personalInfo, experience, education, publications, projects } from '../data/resume-data'

export default function ResumeViewer() {
  return (
    <div style={styles.container}>
      <div style={styles.toolbar} className="resume-no-print">
        <span style={styles.toolbarLabel}>📋 Resume Viewer</span>
        <button style={styles.toolBtn} onClick={() => window.print()}>🖨️ Print</button>
      </div>

      <div style={styles.pageContainer}>
        <div style={styles.page} className="resume-print-page">
          {/* header */}
          <div style={styles.header}>
            <h1 style={styles.name}>HARIT TARWANI</h1>
            <div style={styles.headerLine} />
            <div style={styles.headerInfo}>{personalInfo.title} · {personalInfo.location}</div>
            <div style={styles.headerLinks}>
              {personalInfo.email} · {personalInfo.github} · {personalInfo.linkedin}
            </div>
          </div>

          {/* experience */}
          <Section title="EXPERIENCE">
            {experience.map((exp, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryRow}>
                  <span style={styles.entryTitle}>{exp.title}</span>
                  <span style={styles.entryDate}>{exp.date}</span>
                </div>
                <div style={styles.entryOrg}>{exp.org}</div>
                <p style={styles.entryDesc}>{exp.details}</p>
              </div>
            ))}
          </Section>

          {/* education */}
          <Section title="EDUCATION">
            {education.map((edu, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryRow}>
                  <span style={styles.entryTitle}>{edu.degree}</span>
                  <span style={styles.entryDate}>{edu.date}</span>
                </div>
                <div style={styles.entryOrg}>{edu.school}</div>
                <div style={styles.entryMeta}>GPA: {edu.gpa} · {edu.location}</div>
              </div>
            ))}
          </Section>

          {/* selected projects */}
          <Section title="SELECTED PROJECTS">
            {projects.filter(p => ['Active', 'Shipped'].includes(p.status)).slice(0, 5).map((p, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryRow}>
                  <span style={styles.entryTitle}>{p.icon} {p.name}</span>
                  <span style={styles.entryDate}>{p.tech.slice(0, 3).join(', ')}</span>
                </div>
                <p style={styles.entryDesc}>{p.description}</p>
              </div>
            ))}
          </Section>

          {/* publications */}
          <Section title="PUBLICATIONS">
            {publications.map((pub, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryTitle}>{pub.title}</div>
                <div style={styles.entryOrg}>{pub.authors} — {pub.venue}</div>
                <p style={styles.entryDesc}>{pub.description}</p>
              </div>
            ))}
          </Section>

          <div style={styles.pageFooter}>
            <span>Page 1 of 1</span>
            <span>harit.dev</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// consistent section component for the resume page
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionLine} />
      {children}
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', background: '#525659', fontFamily: "'Tahoma', sans-serif" },
  toolbar: {
    background: 'var(--xp-surface)', borderBottom: '1px solid #a0a0a0', padding: '4px 8px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
  },
  toolbarLabel: { fontSize: 11, fontWeight: 700, color: '#333' },
  toolBtn: {
    fontSize: 10, padding: '2px 8px', border: '1px solid #a0a0a0', borderRadius: 3,
    background: 'linear-gradient(180deg, #fff, #ece9d8)', cursor: 'pointer', fontFamily: "'Tahoma', sans-serif",
  },
  pageContainer: { flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '20px 10px' },
  page: {
    width: 540, 
    minHeight: 700, 
    height: 'max-content', // <-- Add this line
    background: '#fff', 
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    padding: '36px 44px', 
    flexShrink: 0,
  },

  // header
  header: { textAlign: 'center', marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: 4, fontFamily: "'Georgia', serif" },
  headerLine: { height: 2, background: '#003399', margin: '8px auto', width: '60%' },
  headerInfo: { fontSize: 11, color: '#444', marginTop: 4 },
  headerLinks: { fontSize: 9, color: '#888', marginTop: 4 },

  // sections
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#003399', letterSpacing: 2, margin: 0, fontFamily: "'Georgia', serif" },
  sectionLine: { height: 1, background: '#003399', margin: '4px 0 10px' },

  // entries — consistent across all sections
  entry: { marginBottom: 10 },
  entryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 },
  entryTitle: { fontWeight: 700, fontSize: 11, color: '#111' },
  entryDate: { fontSize: 10, color: '#666', fontStyle: 'italic', whiteSpace: 'nowrap' },
  entryOrg: { fontSize: 10, color: '#555', marginTop: 1 },
  entryMeta: { fontSize: 10, color: '#777', marginTop: 2 },
  entryDesc: { fontSize: 10, color: '#333', margin: '3px 0 0', lineHeight: 1.55, textAlign: 'justify' },

  // footer
  pageFooter: {
    marginTop: 20, paddingTop: 8, borderTop: '1px solid #ddd',
    display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#aaa',
  },
}
