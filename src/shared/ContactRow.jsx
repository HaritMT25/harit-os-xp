export function ContactRow({ icon, label, value, href, style = {} }) {
  const content = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      ...style,
    }}>
      <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 13, color: href ? '#1e5799' : '#333', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{content}</a>
  }
  return content
}
