export function SectionHeader({ icon, title, color = '#003399', variant = 'default', style = {} }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: variant === 'compact' ? 10 : 16,
      paddingBottom: 6,
      borderBottom: `2px solid ${color}`,
      ...style,
    }}>
      {icon && <span style={{ fontSize: variant === 'compact' ? 16 : 20 }}>{icon}</span>}
      <h2 style={{
        margin: 0,
        fontSize: variant === 'compact' ? 14 : 20,
        fontWeight: 700,
        color,
        letterSpacing: 0.3,
      }}>{title}</h2>
    </div>
  )
}
