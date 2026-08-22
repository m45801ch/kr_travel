import { describe, expect, it } from 'vitest'
import { addDays, findTimeConflictIds, isIsoDate } from './dateUtils'

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

describe('findTimeConflictIds', () => {
  it('returns activities sharing the same scheduled time', () => {
    expect(findTimeConflictIds([
      { id: 'a', time: '10:00' },
      { id: 'b', time: '10:00' },
      { id: 'c', time: '11:00' },
    ])).toEqual(new Set(['a', 'b']))
  })
})
