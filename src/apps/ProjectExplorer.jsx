import { useState } from 'react'
import { projects } from '../data/resume-data'

export default function ProjectExplorer() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [viewMode, setViewMode] = useState('tiles') // tiles or details

  const project = selectedProject !== null ? projects[selectedProject] : null

  return (
    <div style={styles.container}>
      {/* IE-style Address Bar */}
      <div style={styles.addressBar}>
        <button style={{ ...styles.navBtn, opacity: project ? 1 : 0.4 }} onClick={() => setSelectedProject(null)}>◀</button>
        <button style={{ ...styles.navBtn, opacity: 0.4 }}>▶</button>
        <button style={styles.navBtn} onClick={() => setSelectedProject(null)}>🏠</button>
        <div style={styles.addressInput}>
          <span style={styles.addressIcon}>📁</span>
          <span style={styles.addressText}>
            C:\Users\Harit\Projects{project ? `\\${project.name}` : ''}
          </span>
        </div>
      </div>

      <div style={styles.body}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sideSection}>
            <div style={styles.sideSectionHeader}>
              <span>📂</span>
              <span style={styles.sideSectionTitle}>Project Tasks</span>
            </div>
            <div style={styles.sideLink} onClick={() => setSelectedProject(null)}>
              View all projects
            </div>
            <div style={styles.sideLink} onClick={() => setViewMode(viewMode === 'tiles' ? 'details' : 'tiles')}>
              Toggle view: {viewMode}
            </div>
          </div>
          <div style={styles.sideSection}>
            <div style={styles.sideSectionHeader}>
              <span>📊</span>
              <span style={styles.sideSectionTitle}>Stats</span>
            </div>
            <div style={styles.sideStat}>
              <span style={styles.sideStatNum}>{projects.length}</span>
              <span>Projects</span>
            </div>
            <div style={styles.sideStat}>
              <span style={styles.sideStatNum}>{projects.filter(p => p.status === 'Active').length}</span>
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={styles.main}>
          {!project ? (
            /* Project grid */
            <div style={viewMode === 'tiles' ? styles.tileGrid : styles.detailList}>
              {projects.map((p, i) => (
                viewMode === 'tiles' ? (
                  <ProjectTile key={i} project={p} onClick={() => setSelectedProject(i)} />
                ) : (
                  <ProjectRow key={i} project={p} onClick={() => setSelectedProject(i)} />
                )
              ))}
            </div>
          ) : (
            /* Project detail view */
            <ProjectDetail project={project} onBack={() => setSelectedProject(null)} />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={styles.statusBar}>
        <span>{project ? `1 item selected` : `${projects.length} objects`}</span>
      </div>
    </div>
  )
}

function ProjectTile({ project, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.tile,
        background: hover ? '#e8f0fe' : '#fff',
        borderColor: hover ? '#316ac5' : '#e0e0e0',
      }}
    >
      <div style={{ ...styles.tileIcon, background: `${project.color}15` }}>
        <span style={{ fontSize: 28 }}>{project.icon}</span>
      </div>
      <div style={styles.tileName}>{project.name}</div>
      <div style={{
        ...styles.tileStatus,
        background: project.status === 'Active' ? '#e8f5e9' : '#f5f5f5',
        color: project.status === 'Active' ? '#2e7d32' : '#666',
      }}>
        {project.status}
      </div>
      <div style={styles.tileTech}>
        {project.tech.slice(0, 3).join(' · ')}
      </div>
    </div>
  )
}

function ProjectRow({ project, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.row,
        background: hover ? '#316ac5' : 'transparent',
        color: hover ? '#fff' : '#000',
      }}
    >
      <span style={{ fontSize: 16, width: 24 }}>{project.icon}</span>
      <span style={{ flex: 1, fontWeight: 600 }}>{project.name}</span>
      <span style={{ width: 60, fontSize: 10, textAlign: 'center' }}>{project.status}</span>
      <span style={{ width: 180, fontSize: 10, color: hover ? '#cce' : '#888' }}>{project.tech.slice(0, 3).join(', ')}</span>
    </div>
  )
}

function ProjectDetail({ project, onBack }) {
  return (
    <div style={styles.detail}>
      <button onClick={onBack} style={styles.backBtn}>← Back to Projects</button>
      <div style={styles.detailHeader}>
        <div style={{ ...styles.detailIcon, background: `${project.color}20` }}>
          <span style={{ fontSize: 40 }}>{project.icon}</span>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: '#003399' }}>{project.name}</h2>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 3,
            fontSize: 10,
            fontWeight: 700,
            background: project.status === 'Active' ? '#e8f5e9' : '#f0f0f0',
            color: project.status === 'Active' ? '#2e7d32' : '#666',
            marginTop: 4,
          }}>
            {project.status}
          </div>
        </div>
      </div>

      <div style={styles.detailSection}>
        <h3 style={styles.detailSectionTitle}>Description</h3>
        <p style={styles.detailText}>{project.description}</p>
      </div>

      <div style={styles.detailSection}>
        <h3 style={styles.detailSectionTitle}>Technologies</h3>
        <div style={styles.techTags}>
          {project.tech.map((t, i) => (
            <span key={i} style={{
              ...styles.techTag,
              background: `${project.color}15`,
              borderColor: `${project.color}40`,
              color: project.color,
            }}>{t}</span>
          ))}
        </div>
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
    fontSize: 11,
    background: '#fff',
  },
  addressBar: {
    background: 'var(--xp-surface)',
    borderBottom: '1px solid #a0a0a0',
    padding: '3px 4px',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  navBtn: {
    width: 26,
    height: 22,
    border: '1px solid #a0a0a0',
    borderRadius: 2,
    background: 'linear-gradient(180deg, #fff, #ece9d8)',
    cursor: 'pointer',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInput: {
    flex: 1,
    border: '1px solid #7f9db9',
    background: '#fff',
    padding: '2px 6px',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
  },
  addressIcon: { fontSize: 12 },
  addressText: { fontSize: 11, color: '#333' },

  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: 160,
    background: 'linear-gradient(180deg, #6b93d6, #4f7bc4)',
    padding: 10,
    overflowY: 'auto',
    flexShrink: 0,
  },
  sideSection: { marginBottom: 12 },
  sideSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#fff',
    fontWeight: 700,
    fontSize: 11,
    marginBottom: 6,
  },
  sideSectionTitle: { textShadow: '1px 1px 2px rgba(0,0,0,0.3)' },
  sideLink: {
    color: '#e0ecff',
    fontSize: 10,
    padding: '2px 0 2px 20px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  sideStat: {
    color: '#d0e0ff',
    fontSize: 10,
    padding: '2px 0 2px 20px',
    display: 'flex',
    gap: 6,
  },
  sideStatNum: { fontWeight: 700, color: '#fff' },

  main: {
    flex: 1,
    overflow: 'auto',
    padding: 12,
    background: '#fff',
  },

  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 10,
  },
  tile: {
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    padding: 12,
    cursor: 'pointer',
    transition: 'all 0.1s',
    textAlign: 'center',
  },
  tileIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
  },
  tileName: { fontWeight: 700, fontSize: 11, marginBottom: 4, color: '#222' },
  tileStatus: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: 2,
    fontSize: 9,
    fontWeight: 600,
    marginBottom: 4,
  },
  tileTech: { fontSize: 9, color: '#888' },

  detailList: { display: 'flex', flexDirection: 'column' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: 11,
    borderBottom: '1px solid #f0f0f0',
  },

  statusBar: {
    background: 'var(--xp-surface)',
    borderTop: '1px solid #a0a0a0',
    padding: '2px 8px',
    fontSize: 10,
    color: '#555',
    flexShrink: 0,
  },

  detail: { padding: 8 },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#316ac5',
    cursor: 'pointer',
    fontSize: 11,
    padding: '4px 0',
    marginBottom: 12,
    fontFamily: "'Tahoma', sans-serif",
  },
  detailHeader: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIcon: {
    width: 72,
    height: 72,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailSection: { marginBottom: 16 },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#003399',
    margin: '0 0 6px',
    paddingBottom: 3,
    borderBottom: '1px solid #ddd',
  },
  detailText: {
    margin: 0,
    lineHeight: 1.6,
    color: '#333',
    fontSize: 11,
  },
  techTags: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  techTag: {
    padding: '3px 8px',
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 500,
    border: '1px solid',
  },
}
