// shared UI components — used by both xp apps and quick portfolio

// ─── Profile Header ───────────────────────────────────────
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

// ─── Section Header ───────────────────────────────────────
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

// ─── Experience Entry ─────────────────────────────────────
export function ExperienceEntry({ title, org, date, details, accentColor = '#5b9bd5', style = {} }) {
  return (
    <div style={{
      marginBottom: 16,
      paddingLeft: 14,
      borderLeft: `3px solid ${accentColor}`,
      ...style,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#222' }}>{title}</span>
        <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{date}</span>
      </div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{org}</div>
      {details && <p style={{ fontSize: 13, color: '#444', margin: '6px 0 0', lineHeight: 1.6 }}>{details}</p>}
    </div>
  )
}

// ─── Education Entry ──────────────────────────────────────
export function EducationEntry({ degree, school, gpa, date, location, accentColor = '#e8a030', style = {} }) {
  return (
    <div style={{
      marginBottom: 12,
      paddingLeft: 14,
      borderLeft: `3px solid ${accentColor}`,
      ...style,
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#222' }}>{degree}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{school}</div>
      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
        {[gpa && `GPA: ${gpa}`, date, location].filter(Boolean).join(' · ')}
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────
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

// ─── Skill Badge ──────────────────────────────────────────
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

// ─── Skill Group ──────────────────────────────────────────
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

// ─── Contact Row ──────────────────────────────────────────
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

// ─── Publication Entry ────────────────────────────────────
export function PublicationEntry({ title, authors, venue, description, style = {} }) {
  return (
    <div style={{
      marginBottom: 14,
      paddingLeft: 14,
      borderLeft: '3px solid #6bbd5b',
      ...style,
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#222' }}>{title}</div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{authors} — {venue}</div>
      {description && <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0', lineHeight: 1.5 }}>{description}</p>}
    </div>
  )
}
