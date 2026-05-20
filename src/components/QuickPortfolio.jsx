import { useState } from 'react'
import { personalInfo, education, experience, projects, skills, publications } from '../data/resume-data'
import {
  ProfileHeader, SectionHeader, ExperienceEntry, EducationEntry,
  ProjectCard, SkillGroup, ContactRow, PublicationEntry,
} from '../shared/Components'
import { XPModeButton, XPBanner } from '../shared/ModeSwitcher'

export default function QuickPortfolio({ onSwitchToXP }) {
  const [activeSection, setActiveSection] = useState('about')

  const NAV_ITEMS = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
  ]

  const scrollTo = (id) => {
    setActiveSection(id)
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={styles.page}>
      {/* Top navigation bar */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <span style={styles.navLogo}>
            <span style={styles.navLogoName}>Harit</span>
            <span style={styles.navLogoDot}>.</span>
          </span>
          <div style={styles.navLinks}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  ...styles.navLink,
                  color: activeSection === item.id ? '#0078d7' : '#666',
                  borderBottomColor: activeSection === item.id ? '#0078d7' : 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <XPModeButton onClick={onSwitchToXP} />
        </div>
      </nav>

      {/* Main scrollable content */}
      <main style={styles.main}>

        {/* ─── Hero / About ─── */}
        <section id="section-about" style={styles.hero}>
          <ProfileHeader
            name={personalInfo.name}
            title={personalInfo.title}
            tagline={personalInfo.tagline}
            location={personalInfo.location}
          />
          <div style={styles.heroBio}>
            <p style={styles.bioText}>
              MS Computer Science student at Northeastern University's Khoury College
              with industry experience at <strong>Pandya Corporation</strong> (full-stack & data analytics)
              and research internships at <strong>Academia Sinica</strong> (Taiwan)
              and <strong>Physical Research Laboratory</strong> (India).
              Currently TA for DS 4300 — Large-Scale Information Storage & Retrieval.
            </p>
            <p style={styles.bioText}>
              Builder with broad technical interests spanning reinforcement learning
              for robotics, voice and audio ML, and systems programming.
            </p>
          </div>

          {/* Education inline */}
          <div style={styles.eduRow}>
            {education.map((edu, i) => (
              <EducationEntry key={i} {...edu} />
            ))}
          </div>
        </section>

        <div style={styles.divider} />

        {/* ─── Experience ─── */}
        <section id="section-experience" style={styles.section}>
          <SectionHeader icon="💼" title="Experience" color="#1a56b8" />
          {experience.map((exp, i) => (
            <ExperienceEntry key={i} {...exp} />
          ))}

          {/* Publications */}
          <SectionHeader icon="📝" title="Publications" color="#2e7d32" style={{ marginTop: 24 }} />
          {publications.map((pub, i) => (
            <PublicationEntry key={i} {...pub} />
          ))}
        </section>

        <div style={styles.divider} />

        {/* ─── Projects ─── */}
        <section id="section-projects" style={styles.section}>
          <SectionHeader icon="🚀" title="Projects" color="#e65100" />
          <div style={styles.projectGrid}>
            {projects.map((project, i) => (
              <ProjectCard key={i} {...project} />
            ))}
          </div>
        </section>

        <div style={styles.divider} />

        {/* ─── Skills ─── */}
        <section id="section-skills" style={styles.section}>
          <SectionHeader icon="⚙️" title="Skills & Technologies" color="#6a1b9a" />
          <div style={styles.skillsGrid}>
            {Object.entries(skills).map(([category, data]) => (
              <SkillGroup key={category} category={category} items={data.items} color={data.color} />
            ))}
          </div>
        </section>

        <div style={styles.divider} />

        {/* ─── Contact ─── */}
        <section id="section-contact" style={styles.section}>
          <SectionHeader icon="✉️" title="Get In Touch" color="#00695c" />
          <div style={styles.contactGrid}>
            <div style={styles.contactLeft}>
              <p style={styles.contactText}>
                I'm actively looking for <strong>SDE, ML, and Co-op opportunities</strong>.
                If you'd like to collaborate or have an opportunity in mind, I'd love to hear from you.
              </p>
              <div style={styles.availBadge}>
                <span style={styles.availDot} />
                Open to opportunities
              </div>
            </div>
            <div style={styles.contactRight}>
              <ContactRow icon="📧" label="Email" value={personalInfo.email} href={`mailto:${personalInfo.email}`} />
              <ContactRow icon="🐙" label="GitHub" value={personalInfo.github} href={`https://${personalInfo.github}`} />
              <ContactRow icon="💼" label="LinkedIn" value={personalInfo.linkedin} href={`https://${personalInfo.linkedin}`} />
              <ContactRow icon="📍" label="Location" value={personalInfo.location} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <XPBanner onClick={onSwitchToXP} />
          <p style={styles.footerText}>
            © {new Date().getFullYear()} {personalInfo.name} · Built with React
          </p>
        </footer>
      </main>
    </div>
  )
}

const styles = {
  page: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: '#fafbfc',
    fontFamily: "'Segoe UI', 'Tahoma', -apple-system, sans-serif",
  },

  // Nav
  nav: {
    position: 'sticky',
    top: 0,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e8e8e8',
    zIndex: 100,
    flexShrink: 0,
  },
  navInner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '0 24px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLogo: {
    fontSize: 22,
    fontWeight: 300,
  },
  navLogoName: { fontWeight: 700, color: '#1a1a2e' },
  navLogoDot: { color: '#0078d7' },
  navLinks: {
    display: 'flex',
    gap: 4,
  },
  navLink: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '16px 12px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  // Main
  main: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  // Hero
  hero: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '48px 24px 32px',
  },
  heroBio: {
    marginTop: 24,
    maxWidth: 640,
  },
  bioText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 1.7,
    margin: '0 0 12px',
  },
  eduRow: {
    marginTop: 24,
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
  },

  // Sections
  section: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 24px',
  },
  divider: {
    maxWidth: 900,
    margin: '0 auto',
    height: 1,
    background: '#e8e8e8',
  },

  // Projects grid
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 14,
  },

  // Skills grid
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16,
  },

  // Contact
  contactGrid: {
    display: 'flex',
    gap: 32,
    flexWrap: 'wrap',
  },
  contactLeft: {
    flex: 1,
    minWidth: 240,
  },
  contactRight: {
    flex: 1,
    minWidth: 240,
  },
  contactText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 1.7,
    margin: '0 0 16px',
  },
  availBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: '#e8f5e9',
    borderRadius: 6,
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: 600,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#4caf50',
    flexShrink: 0,
  },

  // Footer
  footer: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '24px 24px 40px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
  },
}
