import { personalInfo, education } from '../data/resume-data'
import { openWindow } from '../hooks/eventBus'
import { ProfileHeader, SectionHeader, EducationEntry, SkillBadge } from '../shared/Components'

export default function AboutMe() {
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sideSection}>
          <div style={styles.sideTitle}>ℹ️ Quick Links</div>
          <div style={styles.sideLink} onClick={() => openWindow('resume')}>View my resume</div>
          <div style={styles.sideLink} onClick={() => openWindow('projects')}>See my projects</div>
          <div style={styles.sideLink} onClick={() => openWindow('contact')}>Contact me</div>
          <div style={styles.sideLink} onClick={() => openWindow('ai')}>Chat with HaritBot</div>
        </div>
        <div style={styles.sideSection}>
          <div style={styles.sideTitle}>📋 Details</div>
          <div style={styles.sideDetail}>
            <span style={styles.detailLabel}>Location</span>
            <span>{personalInfo.location}</span>
          </div>
          <div style={styles.sideDetail}>
            <span style={styles.detailLabel}>Status</span>
            <span style={{ color: '#90ee90' }}>Open to work</span>
          </div>
          <div style={styles.sideDetail}>
            <span style={styles.detailLabel}>Email</span>
            <a href={`mailto:${personalInfo.email}`} style={{ color: '#e0ecff', fontSize: 10, textDecoration: 'underline' }}>{personalInfo.email}</a>
          </div>
          <div style={styles.sideDetail}>
            <span style={styles.detailLabel}>GitHub</span>
            <a href={`https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" style={{ color: '#e0ecff', fontSize: 10, textDecoration: 'underline' }}>{personalInfo.github}</a>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        <ProfileHeader
          name={personalInfo.name}
          title={personalInfo.title}
          tagline={personalInfo.tagline}
          location={personalInfo.location}
          variant="compact"
          style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e0e0e0' }}
        />

        <SectionHeader icon="📝" title="About" variant="compact" color="#003399" />
        <p style={styles.text}>
          MS Computer Science student at Northeastern University's Khoury College
          with industry experience at Pandya Corporation and research internships
          at Academia Sinica (Taiwan) and Physical Research Laboratory (India).
          Currently TA for DS 4300 — Large-Scale Information Storage & Retrieval.
        </p>
        <p style={styles.text}>
          Builder with broad technical interests spanning reinforcement learning for robotics,
          voice and audio ML, and systems programming. Prefer bottom-up iterative development
          and care deeply about engineering quality.
        </p>

        <SectionHeader icon="🎓" title="Education" variant="compact" color="#003399" />
        {education.map((edu, i) => (
          <EducationEntry key={i} {...edu} />
        ))}

        <SectionHeader icon="🔬" title="Interests" variant="compact" color="#003399" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Reinforcement Learning', 'Robotics', 'Voice/Audio ML', 'Transformers', 'Cloud Architecture', 'Systems Programming'].map((tag, i) => (
            <SkillBadge key={i} label={tag} color="#1e5799" size="small" />
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', height: '100%', fontFamily: "'Tahoma', sans-serif", fontSize: 12 },
  sidebar: {
    width: 160, background: 'linear-gradient(180deg, #6b93d6 0%, #3968b5 100%)',
    padding: 12, flexShrink: 0, overflowY: 'auto',
  },
  sideSection: { marginBottom: 14 },
  sideTitle: { color: '#fff', fontWeight: 700, fontSize: 11, marginBottom: 6, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' },
  sideLink: { color: '#e0ecff', fontSize: 10, padding: '4px 0 4px 8px', cursor: 'pointer', textDecoration: 'underline' },
  sideDetail: { color: '#d0e0ff', fontSize: 10, padding: '3px 0 3px 8px', display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 4 },
  detailLabel: { fontWeight: 700, color: '#fff', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  main: { flex: 1, padding: 16, overflowY: 'auto', background: '#fff' },
  text: { margin: '0 0 8px', lineHeight: 1.6, color: '#333', fontSize: 12, textAlign: 'justify' },
}
