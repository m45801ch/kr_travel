import type { Currency } from './types'

export interface CurrencyOption {
  code: Currency
  label: string
  name: string
  symbol?: string
}

const COMMON_CURRENCIES: Array<{ code: Currency; name: string; symbol: string }> = [
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: '$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CNY', name: 'Chinese Renminbi Yuan', symbol: '¥' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
]

const CURRENCY_NAME_OVERRIDES: Record<string, string> = {
  TWD: '台幣', KRW: '韓元', JPY: '日圓', USD: '美元', HKD: '港幣', GBP: '英鎊', EUR: '歐元', CNY: '人民幣', THB: '泰銖', SGD: '新加坡幣', AUD: '澳幣', CAD: '加幣',
}

const APP_INTEGER_CURRENCIES = new Set<Currency>(['TWD'])

const displayNames = typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['zh-Hant-TW', 'zh-Hant', 'zh'], { type: 'currency' })
  : undefined

export const currencyOptions: CurrencyOption[] = COMMON_CURRENCIES.map((currency) => createCurrencyOption(currency.code, currency.name, currency.symbol))

export function createCurrencyOption(code: Currency, name = code, symbol?: string): CurrencyOption {
  const normalizedCode = code.toUpperCase()
  return {
    code: normalizedCode,
    name,
    symbol,
    label: `${currencyLabel(normalizedCode, name)}（${normalizedCode}）`,
  }
}

export function currencyLabel(currency: Currency, fallback?: string): string {
  const normalizedCode = currency.toUpperCase()
  return CURRENCY_NAME_OVERRIDES[normalizedCode] ?? displayNames?.of(normalizedCode) ?? fallback ?? normalizedCode
}

export function getCurrencyFractionDigits(currency: Currency): number {
  if (APP_INTEGER_CURRENCIES.has(currency.toUpperCase())) return 0
  try {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}
