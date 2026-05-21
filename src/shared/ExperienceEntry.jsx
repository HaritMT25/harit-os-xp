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
