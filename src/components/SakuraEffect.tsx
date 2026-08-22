import { useMemo } from 'react'

type Petal = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  swayDuration: number
  swayDelay: number
  rotate: number
  opacity: number
}

export function SakuraEffect() {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 10,
      duration: 9 + Math.random() * 7,
      delay: Math.random() * 8,
      swayDuration: 2.5 + Math.random() * 2,
      swayDelay: Math.random() * 2,
      rotate: Math.random() * 360,
      opacity: 0.55 + Math.random() * 0.4,
    }))
  }, [])

  return (
    <div className="sakura-layer" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="sakura-petal"
          style={
            {
              '--left': `${p.left}%`,
              '--size': `${p.size}px`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--sway-duration': `${p.swayDuration}s`,
              '--sway-delay': `${p.swayDelay}s`,
              '--rotate': `${p.rotate}deg`,
              '--opacity': p.opacity,
            } as React.CSSProperties
          }
        >
          🌸
        </span>
      ))}
    </div>
  )
}
