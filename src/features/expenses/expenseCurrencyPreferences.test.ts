import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadExpenseCurrencyPreferences, saveExpenseCurrencyPreference } from './expenseCurrencyPreferences'

function createStorage() {
  const values = new Map<string, string>()
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
}

describe('expense currency preferences', () => {
  beforeEach(() => vi.stubGlobal('localStorage', createStorage()))
  afterEach(() => vi.unstubAllGlobals())

  it('remembers both currency selections for the next expense form', () => {
    saveExpenseCurrencyPreference('currency', 'CHF')
    saveExpenseCurrencyPreference('conversionCurrency', 'USD')

    expect(loadExpenseCurrencyPreferences()).toEqual({ currency: 'CHF', conversionCurrency: 'USD' })
  })
})
