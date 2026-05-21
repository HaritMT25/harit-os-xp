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
