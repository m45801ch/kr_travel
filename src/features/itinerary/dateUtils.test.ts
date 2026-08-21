import { describe, expect, it } from 'vitest'
import { addDays, isIsoDate } from './dateUtils'

describe('date utilities', () => {
  it('adds days without shifting the date across local timezones', () => {
    expect(addDays('2027-02-02', 0)).toBe('2027-02-02')
    expect(addDays('2027-02-02', 1)).toBe('2027-02-03')
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
  })

  it('recognizes the date input format', () => {
    expect(isIsoDate('2027-02-02')).toBe(true)
    expect(isIsoDate('2027/02/02')).toBe(false)
  })
})
