export function SkillBadge({ label, color = '#1e5799', size = 'default', style = {} }) {
  const isSmall = size === 'small'
  return (
    <span style={{
      background: `${color}12`,
      border: `1px solid ${color}35`,
      borderRadius: 4,
      padding: isSmall ? '2px 6px' : '4px 10px',
      fontSize: isSmall ? 10 : 12,
      color,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {label}
    </span>
  )
}
