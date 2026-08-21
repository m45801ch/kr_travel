import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLatestExchangeRate, getSupportedCurrencies, resetSupportedCurrenciesCache } from './frankfurter'

describe('Frankfurter integration', () => {
  afterEach(() => {
    resetSupportedCurrenciesCache()
    vi.unstubAllGlobals()
  })

  it('returns the latest rate supplied by the service', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ base: 'JPY', quote: 'TWD', rate: 0.215, date: '2026-08-21' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getLatestExchangeRate('JPY', 'TWD')).resolves.toMatchObject({ base: 'JPY', quote: 'TWD', rate: 0.215, date: '2026-08-21' })
    expect(fetchMock).toHaveBeenCalledWith('https://api.frankfurter.dev/v2/rate/JPY/TWD')
  })

  it('loads and localises the currencies advertised by the service', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { iso_code: 'TWD', name: 'New Taiwan Dollar', symbol: '$' },
        { iso_code: 'VND', name: 'Vietnamese Đồng', symbol: '₫' },
        { iso_code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { iso_code: 'TOO-LONG', name: 'Invalid', symbol: '?' },
      ],
    })
    vi.stubGlobal('fetch', fetchMock)

    const currencies = await getSupportedCurrencies()

    expect(fetchMock).toHaveBeenCalledWith('https://api.frankfurter.dev/v2/currencies')
    expect(currencies.map((currency) => currency.code)).toEqual(['JPY', 'TWD', 'VND'])
    expect(currencies.find((currency) => currency.code === 'TWD')).toMatchObject({ label: '台幣（TWD）', name: 'New Taiwan Dollar' })
    expect(currencies.find((currency) => currency.code === 'VND')).toMatchObject({ name: 'Vietnamese Đồng', symbol: '₫' })
  })

  it('does not make a network request when the currencies match', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(getLatestExchangeRate('TWD', 'TWD')).resolves.toMatchObject({ base: 'TWD', quote: 'TWD', rate: 1 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports an understandable error for an unavailable rate', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    await expect(getLatestExchangeRate('GBP', 'TWD')).rejects.toThrow('目前無法取得匯率')
  })
})
