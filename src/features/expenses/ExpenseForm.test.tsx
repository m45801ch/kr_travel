import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Expense, ExpenseSplit, Member } from '../../domain/types'
import { resetSupportedCurrenciesCache } from '../../integrations/exchangeRates/frankfurter'
import { ExpenseForm } from './ExpenseForm'

const members: Member[] = [
  { id: 'me', tripId: 'trip-1', name: '我', color: '#ef8490', illustrationId: 'hanbok-woman', notes: '' },
  { id: 'friend', tripId: 'trip-1', name: '旅伴', color: '#8ba9d6', illustrationId: 'hanbok-man', notes: '' },
]

const currencies = [
  { iso_code: 'TWD', name: 'New Taiwan Dollar', symbol: '$' },
  { iso_code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { iso_code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { iso_code: 'USD', name: 'United States Dollar', symbol: '$' },
  { iso_code: 'VND', name: 'Vietnamese Đồng', symbol: '₫' },
  { iso_code: 'CNY', name: 'Chinese Renminbi Yuan', symbol: '¥' },
  { iso_code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
]

function mockFrankfurter() {
  return vi.fn(async (url: string) => ({
    ok: true,
    json: async () => {
      if (url.endsWith('/currencies')) return currencies
      const match = /rate\/([A-Z]{3})\/([A-Z]{3})/.exec(url)
      const base = match?.[1] ?? 'TWD'
      const quote = match?.[2] ?? 'TWD'
      return { base, quote, rate: base === 'CHF' && quote === 'TWD' ? 35 : 1, date: '2026-08-21' }
    },
  }))
}

describe('ExpenseForm', () => {
  afterEach(() => {
    resetSupportedCurrenciesCache()
    vi.unstubAllGlobals()
  })

  it('loads an API-supported currency outside the fallback list, searches it, and uses its rate when saving', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', mockFrankfurter())
    const onSave = vi.fn<(expense: Expense, splits: ExpenseSplit[]) => void>()

    render(<ExpenseForm tripId="trip-1" baseCurrency="TWD" members={members} onSave={onSave} onCancel={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('已載入 7 種可搜尋幣別。')).toBeInTheDocument())
    expect(screen.getByLabelText('原始幣別')).toHaveValue('日圓（JPY）')
    expect(screen.getByLabelText('換算為')).toHaveValue('台幣（TWD）')
    await user.click(screen.getByLabelText('換算為'))
    expect(screen.getAllByRole('option').map((option) => option.textContent).join(' ')).toMatch(/JPY.*KRW.*USD.*VND.*CNY/)
    await user.type(screen.getByLabelText('金額'), '10')
    await user.click(screen.getByLabelText('原始幣別'))
    await user.type(screen.getByLabelText('原始幣別'), 'CHF')
    await user.click(screen.getByRole('option', { name: /CHF/ }))

    await waitFor(() => expect(screen.getByText('1 CHF = 35 TWD')).toBeInTheDocument())
    expect(screen.getByLabelText('換算後價格')).toHaveValue('$350')
    expect(screen.getByLabelText('換算後價格')).toHaveAttribute('readonly')
    await user.click(screen.getByLabelText('啟用分攤旅伴'))
    await user.click(screen.getByLabelText('我'))
    await user.click(screen.getByLabelText('旅伴'))
    await user.click(screen.getByRole('button', { name: '儲存支出' }))

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    const [expense, splits] = onSave.mock.calls[0]
    expect(expense).toMatchObject({
      tripId: 'trip-1',
      amountMinor: 1000,
      currency: 'CHF',
      conversionCurrency: 'TWD',
      conversionRate: 35,
      convertedAmountMinor: 350,
      baseAmountMinor: 350,
      paymentMethod: 'cash',
    })
    expect(splits).toHaveLength(2)
  })

  it('saves the selected payment method', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', mockFrankfurter())
    const onSave = vi.fn<(expense: Expense, splits: ExpenseSplit[]) => void>()

    render(<ExpenseForm tripId="trip-1" baseCurrency="TWD" members={members} onSave={onSave} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText('金額'), '10')
    await user.selectOptions(screen.getByLabelText('付款方式'), 'google-pay')
    await user.click(screen.getByRole('button', { name: '儲存支出' }))

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    expect(onSave.mock.calls[0][0]).toMatchObject({ paymentMethod: 'google-pay' })
  })

  it('uses an existing record to initialise the edit form', () => {
    vi.stubGlobal('fetch', mockFrankfurter())
    const initial: Expense = {
      id: 'expense-1', tripId: 'trip-1', date: '2026-08-21', amountMinor: 1200, currency: 'JPY', exchangeRateToBase: 0.22, baseAmountMinor: 264, conversionCurrency: 'TWD', conversionRate: 0.22, convertedAmountMinor: 264, category: '交通', payerId: 'me', paymentMethod: 'apple-pay', splitMode: 'equal', notes: '機場快線',
    }

    render(<ExpenseForm tripId="trip-1" baseCurrency="TWD" members={members} initial={initial} onSave={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '編輯支出' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('1200')).toBeInTheDocument()
    expect(screen.getByDisplayValue('機場快線')).toBeInTheDocument()
    expect(screen.getByLabelText('付款方式')).toHaveValue('apple-pay')
    expect(screen.getByRole('button', { name: '儲存修改' })).toBeInTheDocument()
  })

  it('restores the last selected currencies when opening a new expense form', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', mockFrankfurter())
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } })
    const first = render(<ExpenseForm tripId="trip-1" baseCurrency="TWD" members={members} onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.click(screen.getByLabelText('原始幣別'))
    await user.type(screen.getByLabelText('原始幣別'), 'CHF')
    await user.click(screen.getByRole('option', { name: /CHF/ }))
    await user.click(screen.getByLabelText('換算為'))
    await user.type(screen.getByLabelText('換算為'), 'USD')
    await user.click(screen.getByRole('option', { name: /USD/ }))
    first.unmount()

    render(<ExpenseForm tripId="trip-1" baseCurrency="TWD" members={members} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText('原始幣別')).toHaveValue('瑞士法郎（CHF）')
    expect(screen.getByLabelText('換算為')).toHaveValue('美元（USD）')
  })

  it('keeps split participants disabled and empty until enabled', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', mockFrankfurter())
    const onSave = vi.fn<(expense: Expense, splits: ExpenseSplit[]) => void>()

    render(<ExpenseForm tripId="trip-1" baseCurrency="TWD" members={members} onSave={onSave} onCancel={vi.fn()} />)

    const splitToggle = screen.getByLabelText('啟用分攤旅伴')
    const selfCheckbox = screen.getByLabelText('我')
    expect(splitToggle).not.toBeChecked()
    expect(selfCheckbox).toBeDisabled()

    await user.click(splitToggle)
    expect(selfCheckbox).toBeEnabled()
    expect(selfCheckbox).not.toBeChecked()
    await user.click(selfCheckbox)
    expect(selfCheckbox).toBeChecked()
  })
})
