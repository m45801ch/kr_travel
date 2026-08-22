import { describe, expect, it } from 'vitest'
import { formatRouteEstimate, estimateRoute } from './routeEstimate'

describe('route estimates', () => {
  it('estimates distance and walking time from two coordinates', () => {
    const result = estimateRoute({ latitude: 35.6812, longitude: 139.7671 }, { latitude: 35.7101, longitude: 139.8107 })
    expect(result.distanceKm).toBeGreaterThan(4)
    expect(result.distanceKm).toBeLessThan(6)
    expect(result.walkMinutes).toBeGreaterThan(50)
  })

  it('formats a compact next-stop label', () => {
    expect(formatRouteEstimate({ distanceKm: 2.8, walkMinutes: 35 }, '晴空塔')).toBe('距晴空塔約 2.8 km · 步行約 35 分')
  })
})
