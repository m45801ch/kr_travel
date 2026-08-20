import { describe, expect, it } from 'vitest'
import { convertMinorUnits, toMinorUnits } from './money'

describe('money', () => {
  it('converts values to minor units', () => {
    expect(toMinorUnits('1200', 'KRW')).toBe(1200)
    expect(toMinorUnits('12.5', 'USD')).toBe(1250)
    expect(convertMinorUnits(1000, 0.04)).toBe(40)
  })

  it('rejects malformed and negative amounts', () => {
    expect(() => toMinorUnits('-1', 'TWD')).toThrow()
    expect(() => toMinorUnits('abc', 'TWD')).toThrow()
  })
})
