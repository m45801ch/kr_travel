import { describe, expect, it } from 'vitest'
import { convertAmountToMinorUnits, convertMinorUnits, toMinorUnits } from './money'

describe('money', () => {
  it('converts values to minor units', () => {
    expect(toMinorUnits('1200', 'KRW')).toBe(1200)
    expect(toMinorUnits('12.5', 'USD')).toBe(1250)
    expect(convertMinorUnits(1000, 0.04)).toBe(40)
  })

  it('converts between currencies with different fraction digits', () => {
    expect(convertAmountToMinorUnits(toMinorUnits('1000', 'JPY'), 'JPY', 'TWD', 0.22)).toBe(220)
    expect(convertAmountToMinorUnits(toMinorUnits('12.5', 'USD'), 'USD', 'JPY', 150)).toBe(1875)
  })

  it('rejects malformed and negative amounts', () => {
    expect(() => toMinorUnits('-1', 'TWD')).toThrow()
    expect(() => toMinorUnits('abc', 'TWD')).toThrow()
    expect(() => convertAmountToMinorUnits(100, 'TWD', 'USD', -1)).toThrow()
  })
})
