import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../data/db'
import { resetSupportedCurrenciesCache } from '../../integrations/exchangeRates/frankfurter'
import { ExpensePage } from './ExpensePage'

async function clearDatabase() {
  await Promise.all([
    db.trips.clear(), db.days.clear(), db.activities.clear(), db.members.clear(), db.expenses.clear(), db.expenseSplits.clear(), db.listItems.clear(), db.weatherCache.clear(), db.settings.clear(), db.photos.clear(),
  ])
}

describe('ExpensePage', () => {
  beforeEach(async () => {
    resetSupportedCurrenciesCache()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ iso_code: 'TWD', name: 'New Taiwan Dollar', symbol: '$' }, { iso_code: 'JPY', name: 'Japanese Yen', symbol: '¥' }] }))
    await clearDatabase()
    await db.trips.add({ id: 'trip-1', title: '東京小旅行', destination: '東京', startDate: '2026-08-21', endDate: '2026-08-24', baseCurrency: 'TWD', budgetMinor: 10000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true })
    await db.members.bulkAdd([
      { id: 'me', tripId: 'trip-1', name: '我', color: '#ef8490', illustrationId: 'hanbok-woman', notes: '' },
      { id: 'friend', tripId: 'trip-1', name: '旅伴', color: '#8ba9d6', illustrationId: 'hanbok-man', notes: '' },
    ])
    await db.expenses.add({ id: 'expense-1', tripId: 'trip-1', date: '2026-08-21', amountMinor: 1200, currency: 'JPY', exchangeRateToBase: 0.22, baseAmountMinor: 264, conversionCurrency: 'TWD', conversionRate: 0.22, convertedAmountMinor: 264, category: '交通', payerId: 'me', splitMode: 'equal', notes: '機場快線' })
    await db.expenseSplits.bulkAdd([
      { id: 'expense-1-split-me', expenseId: 'expense-1', tripId: 'trip-1', memberId: 'me', amountMinor: 132, percentage: 50, settled: true },
      { id: 'expense-1-split-friend', expenseId: 'expense-1', tripId: 'trip-1', memberId: 'friend', amountMinor: 132, percentage: 50, settled: false },
    ])
  })

  afterEach(async () => {
    await clearDatabase()
    resetSupportedCurrenciesCache()
    vi.unstubAllGlobals()
  })

  it('opens an existing expense in the edit form when its card is clicked', async () => {
    const user = userEvent.setup()
    render(<ExpensePage />)

    const expenseCard = await screen.findByRole('button', { name: '編輯交通支出' })
    expect(screen.getByRole('img', { name: '交通類別圖示' })).toBeInTheDocument()
    await user.click(expenseCard)

    await waitFor(() => expect(screen.getByRole('heading', { name: '編輯支出' })).toBeInTheDocument())
    expect(screen.getByDisplayValue('1200')).toBeInTheDocument()
    expect(screen.getByDisplayValue('機場快線')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '儲存修改' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '刪除這筆支出' })).toBeInTheDocument()
  })

  it('removes an edited expense and its splits after delete confirmation', async () => {
    const user = userEvent.setup()
    const confirmMock = vi.fn().mockReturnValue(true)
    vi.stubGlobal('confirm', confirmMock)
    render(<ExpensePage />)

    await user.click(await screen.findByRole('button', { name: '編輯交通支出' }))
    await user.click(await screen.findByRole('button', { name: '刪除這筆支出' }))

    await waitFor(() => expect(screen.getByText('還沒有支出紀錄，先記下一筆旅費吧。')).toBeInTheDocument())
    expect(confirmMock).toHaveBeenCalledWith('確定要刪除這筆支出嗎？此操作無法復原。')
    await expect(db.expenses.get('expense-1')).resolves.toBeUndefined()
    await expect(db.expenseSplits.where('expenseId').equals('expense-1').count()).resolves.toBe(0)
  })
})
