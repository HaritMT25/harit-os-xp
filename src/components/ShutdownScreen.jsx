import { useState, useEffect } from 'react'

// shutdown animation: save → shutting down → fade to black → callback
export default function ShutdownScreen({ onComplete }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000)
    const t2 = setTimeout(() => setPhase(2), 2500)
    const t3 = setTimeout(() => onComplete(), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: phase === 2
        ? '#000'
        : 'linear-gradient(180deg, #0050a0 0%, #003580 30%, #002060 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.8s ease',
    }}>
      {phase < 2 && (
        <div style={{
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease',
          opacity: phase === 2 ? 0 : 1,
          transition: 'opacity 0.5s',
        }}>
          <div style={{
            fontSize: 28, fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 300, color: '#fff', marginBottom: 20,
            letterSpacing: 1,
          }}>
            {phase === 0 ? 'Saving your settings...' : 'HaritOS is shutting down...'}
          </div>
          <div style={{
            display: 'flex', gap: 6, justifyContent: 'center',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#4fc3f7',
                animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
              }} />
            ))}
          </div>
          {phase === 0 && (
            <div style={{
              color: '#6aa8d8', fontSize: 12, marginTop: 16,
              fontFamily: "'Tahoma', sans-serif",
            }}>
              Thanks for visiting!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
