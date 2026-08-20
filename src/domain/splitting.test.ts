import { describe, expect, it } from 'vitest'
import { calculateSettlement, splitExpense } from './splitting'
import type { Expense, Member } from './types'

const expense: Expense = { id: 'expense-1', tripId: 'trip-1', date: '2026-08-25', amountMinor: 1000, currency: 'TWD', exchangeRateToBase: 1, baseAmountMinor: 1000, category: 'food', payerId: 'a', splitMode: 'equal', notes: '' }
const members: Member[] = [{ id: 'a', tripId: 'trip-1', name: 'A', color: '#f00', illustrationId: 'hanbok-woman', notes: '' }, { id: 'b', tripId: 'trip-1', name: 'B', color: '#00f', illustrationId: 'hanbok-man', notes: '' }]

describe('splitting', () => {
  it('splits equal amounts and preserves the remainder', () => {
    const splits = splitExpense({ ...expense, baseAmountMinor: 1001 }, [{ memberId: 'a' }, { memberId: 'b' }, { memberId: 'c' }])
    expect(splits.map((split) => split.amountMinor)).toEqual([334, 334, 333])
  })

  it('calculates a transfer from debtor to payer', () => {
    const splits = splitExpense(expense, [{ memberId: 'a' }, { memberId: 'b' }])
    expect(calculateSettlement([expense], members, splits)).toEqual([{ fromMemberId: 'b', toMemberId: 'a', amountMinor: 500 }])
  })
})
