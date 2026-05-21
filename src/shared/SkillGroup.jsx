import { SkillBadge } from './SkillBadge'

export function SkillGroup({ category, items = [], color = '#333', style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <div style={{
        fontWeight: 700,
        fontSize: 13,
        color,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        {category}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((item, i) => (
          <SkillBadge key={i} label={item} color={color} />
        ))}
      </div>
    </div>
  )
}
