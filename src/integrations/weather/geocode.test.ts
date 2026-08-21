import { describe, expect, it } from 'vitest'
import { geocodeDestination } from './openMeteo'

describe('geocodeDestination', () => {
  it('resolves the Chinese name 首爾 via the alias table to Seoul, Korea', async () => {
    const result = await geocodeDestination('首爾')
    expect(result.name).toBe('Seoul')
    expect(result.latitude).toBeCloseTo(37.566, 0)
    expect(result.longitude).toBeCloseTo(126.9784, 0)
  }, 20000)

  it('resolves 釜山 to Busan, Korea', async () => {
    const result = await geocodeDestination('釜山')
    expect(result.name).toBe('Busan')
    expect(result.longitude).toBeGreaterThan(128)
  }, 20000)

  it('resolves English Seoul directly without the alias table', async () => {
    const result = await geocodeDestination('Seoul')
    expect(result.name).toBe('Seoul')
  }, 20000)

  it('resolves 濟州 to Jeju City in Korea, not Ethiopia', async () => {
    const result = await geocodeDestination('濟州')
    expect(result.name).toContain('Jeju')
    expect(result.longitude).toBeGreaterThan(120)
  }, 20000)

  it('falls back gracefully to an unmapped Chinese-style place using the raw name', async () => {
    // 非對照表內的中文地名(如「大邱」有對照表,改用一個沒有對照的自訂字串則走原始名稱)
    const result = await geocodeDestination('大邱')
    expect(result.name).toBe('Daegu')
  }, 20000)

  it('resolves a city outside Korea', async () => {
    const result = await geocodeDestination('New York')
    expect(result.name).toContain('New York')
    expect(result.longitude).toBeLessThan(-70)
  }, 20000)
})
