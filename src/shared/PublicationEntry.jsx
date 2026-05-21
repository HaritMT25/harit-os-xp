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
