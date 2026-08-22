import { useMemo } from 'react'

type Petal = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  rotate: number
  opacity: number
  shape: 'flower' | 'sparkle' | 'leaf'
}

export function SakuraEffect() {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 16 + Math.random() * 14,
      duration: 7 + Math.random() * 7,
      delay: -Math.random() * 14,
      rotate: Math.random() * 360,
      opacity: 0.58 + Math.random() * 0.36,
      shape: i % 5 === 0 ? 'sparkle' : i % 3 === 0 ? 'leaf' : 'flower',
    }))
  }, [])

  return (
    <div className="sakura-layer" aria-hidden="true" data-testid="sakura-effect">
      {petals.map((p) => (
        <span
          key={p.id}
          className={`sakura-petal sakura-petal--${p.shape}`}
          style={
            {
              '--left': `${p.left}%`,
              '--size': `${p.size}px`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--rotate': `${p.rotate}deg`,
              '--opacity': p.opacity,
            } as React.CSSProperties
          }
        >
          {p.shape === 'sparkle' ? '✦' : p.shape === 'leaf' ? '❧' : '✿'}
        </span>
      ))}
    </div>
  )
}
