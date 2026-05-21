import { SkillBadge } from './SkillBadge'

export function ProjectCard({ name, icon, tech = [], description, color = '#333', status, variant = 'default', style = {} }) {
  const isCompact = variant === 'compact'
  return (
    <div style={{
      border: '1px solid #e8e8e8',
      borderRadius: 8,
      padding: isCompact ? 14 : 18,
      borderLeft: `4px solid ${color}`,
      background: '#fff',
      transition: 'box-shadow 0.15s',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {icon && <span style={{ fontSize: isCompact ? 18 : 22 }}>{icon}</span>}
        <span style={{ fontWeight: 700, fontSize: isCompact ? 13 : 15, color: '#222', flex: 1 }}>{name}</span>
        {status && (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 10,
            background: status === 'Active' ? '#e8f5e9' : '#f5f5f5',
            color: status === 'Active' ? '#2e7d32' : '#666',
          }}>{status}</span>
        )}
      </div>
      {description && <p style={{ fontSize: 12, color: '#555', margin: '0 0 8px', lineHeight: 1.6 }}>{description}</p>}
      {tech.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tech.map((t, i) => (
            <SkillBadge key={i} label={t} color={color} size="small" />
          ))}
        </div>
      )}
    </div>
  )
}
