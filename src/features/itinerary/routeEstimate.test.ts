import { describe, expect, it } from 'vitest'
import { formatRouteEstimate, formatWalkDuration, estimateRoute } from './routeEstimate'

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

  it('formats 60 minutes or more as hours and minutes', () => {
    expect(formatWalkDuration(59)).toBe('59 分')
    expect(formatWalkDuration(60)).toBe('1 小時 0 分')
    expect(formatWalkDuration(100)).toBe('1 小時 40 分')
    expect(formatRouteEstimate({ distanceKm: 8.2, walkMinutes: 100 }, '東京鐵塔')).toBe('距東京鐵塔約 8.2 km · 步行約 1 小時 40 分')
  })
})
