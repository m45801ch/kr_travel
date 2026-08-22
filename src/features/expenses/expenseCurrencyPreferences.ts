import type { Currency } from '../../domain/types'

const STORAGE_KEY = 'travel-expense-currency-preferences'

export interface ExpenseCurrencyPreferences {
  currency?: Currency
  conversionCurrency?: Currency
}

function getStorage(): Storage | undefined {
  if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return undefined
  return localStorage
}

export function loadExpenseCurrencyPreferences(): ExpenseCurrencyPreferences {
  try {
    const raw = getStorage()?.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const value = parsed as Record<string, unknown>
    return {
      ...(typeof value.currency === 'string' ? { currency: value.currency } : {}),
      ...(typeof value.conversionCurrency === 'string' ? { conversionCurrency: value.conversionCurrency } : {}),
    }
  } catch {
    return {}
  }
}

export function saveExpenseCurrencyPreference(key: keyof ExpenseCurrencyPreferences, value: Currency): void {
  const storage = getStorage()
  if (!storage || typeof storage.setItem !== 'function') return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...loadExpenseCurrencyPreferences(), [key]: value }))
  } catch {
    // Storage may be unavailable or full; currency selection still works for this form.
  }
}
