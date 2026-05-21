export function ProfileHeader({ name, title, tagline, location, avatar, variant = 'default', style = {} }) {
  const isCompact = variant === 'compact'
  return (
    <div style={{
      display: 'flex',
      gap: isCompact ? 12 : 20,
      alignItems: 'center',
      ...style,
    }}>
      <div style={{
        width: isCompact ? 56 : 80,
        height: isCompact ? 56 : 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1e5799, #7db9e8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: isCompact ? 22 : 32,
        fontWeight: 700,
        flexShrink: 0,
        border: '3px solid #fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>
        {avatar ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name?.[0] || 'H'}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: isCompact ? 18 : 28, fontWeight: 700, color: '#1a1a2e' }}>{name}</h2>
        {title && <div style={{ color: '#555', fontSize: isCompact ? 12 : 15, marginTop: 2 }}>{title}</div>}
        {tagline && <div style={{ color: '#888', fontSize: isCompact ? 11 : 13, marginTop: 2, fontStyle: 'italic' }}>{tagline}</div>}
        {location && <div style={{ color: '#999', fontSize: isCompact ? 10 : 12, marginTop: 4 }}>📍 {location}</div>}
      </div>
    </div>
  )
}
