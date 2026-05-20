import { skills } from '../data/resume-data'
import { SkillGroup } from '../shared/Components'

export default function SkillsPanel() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={{ fontSize: 32 }}>⚙️</span>
        <div>
          <div style={styles.headerTitle}>Skills & Technologies</div>
          <div style={styles.headerSub}>Technical and professional competencies</div>
        </div>
      </div>
      <div style={styles.grid}>
        {Object.entries(skills).map(([category, data]) => (
          <div key={category} style={styles.card}>
            <SkillGroup category={category} items={data.items} color={data.color} />
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', fontFamily: "'Tahoma', sans-serif", fontSize: 11, background: '#fff', overflowY: 'auto' },
  header: {
    background: 'linear-gradient(180deg, #fff 0%, #e8f0fe 100%)', padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #a0c0e8',
  },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#003399' },
  headerSub: { fontSize: 11, color: '#555', marginTop: 2 },
  grid: {
    padding: 16, display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12,
  },
  card: {
    border: '1px solid #e0e0e0', borderRadius: 4, padding: '12px 14px',
    background: '#fafafa',
  },
}
