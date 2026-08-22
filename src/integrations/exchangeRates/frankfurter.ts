import { createCurrencyOption, type CurrencyOption } from '../../domain/currency'
import type { Currency } from '../../domain/types'

const API_BASE = 'https://api.frankfurter.dev/v2'
let currenciesRequest: Promise<CurrencyOption[]> | undefined

export interface ExchangeRateSnapshot {
  base: Currency
  quote: Currency
  rate: number
  date: string
  fetchedAt: string
}

export async function getSupportedCurrencies(): Promise<CurrencyOption[]> {
  if (!currenciesRequest) currenciesRequest = requestSupportedCurrencies()
  try {
    return await currenciesRequest
  } catch (error) {
    currenciesRequest = undefined
    throw error
  }
}

export function resetSupportedCurrenciesCache() {
  currenciesRequest = undefined
}

export async function getLatestExchangeRate(base: Currency, quote: Currency): Promise<ExchangeRateSnapshot> {
  const normalizedBase = base.toUpperCase()
  const normalizedQuote = quote.toUpperCase()
  const fetchedAt = new Date().toISOString()
  if (normalizedBase === normalizedQuote) {
    return { base: normalizedBase, quote: normalizedQuote, rate: 1, date: fetchedAt.slice(0, 10), fetchedAt }
  }

  const response = await fetch(`${API_BASE}/rate/${encodeURIComponent(normalizedBase)}/${encodeURIComponent(normalizedQuote)}`)
  if (!response.ok) throw new Error('目前無法取得匯率，請稍後再試。')

  const payload: unknown = await response.json()
  if (!isRateResponse(payload) || payload.base !== normalizedBase || payload.quote !== normalizedQuote || !Number.isFinite(payload.rate) || payload.rate <= 0) {
    throw new Error('取得的匯率資料格式不正確，請稍後再試。')
  }

  return { base: payload.base, quote: payload.quote, rate: payload.rate, date: payload.date, fetchedAt }
}

async function requestSupportedCurrencies(): Promise<CurrencyOption[]> {
  const response = await fetch(`${API_BASE}/currencies`)
  if (!response.ok) throw new Error('目前無法載入支援的幣別，請稍後再試。')

  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) throw new Error('取得的幣別資料格式不正確，請稍後再試。')

  const currencies = payload.filter(isCurrencyResponse).map((currency) => createCurrencyOption(currency.iso_code, currency.name, currency.symbol))
  if (!currencies.length) throw new Error('目前沒有可用的幣別資料，請稍後再試。')
  return currencies.sort((left, right) => left.label.localeCompare(right.label, 'zh-Hant-TW'))
}

function isRateResponse(value: unknown): value is { base: Currency; quote: Currency; rate: number; date: string } {
  return typeof value === 'object' && value !== null
    && typeof (value as { base?: unknown }).base === 'string'
    && typeof (value as { quote?: unknown }).quote === 'string'
    && typeof (value as { rate?: unknown }).rate === 'number'
    && typeof (value as { date?: unknown }).date === 'string'
}

function isCurrencyResponse(value: unknown): value is { iso_code: Currency; name: string; symbol?: string } {
  return typeof value === 'object' && value !== null
    && typeof (value as { iso_code?: unknown }).iso_code === 'string'
    && /^[A-Z]{3}$/.test((value as { iso_code: string }).iso_code)
    && typeof (value as { name?: unknown }).name === 'string'
    && (typeof (value as { symbol?: unknown }).symbol === 'string' || typeof (value as { symbol?: unknown }).symbol === 'undefined')
}
