import { getCurrencyFractionDigits } from './currency'
import type { Currency } from './types'

export function toMinorUnits(amount: string, currency: Currency): number {
  const value = Number(amount)
  if (!Number.isFinite(value) || value < 0) throw new Error('金額必須是非負數字')
  return Math.round(value * 10 ** getCurrencyFractionDigits(currency))
}

export function fromMinorUnits(amount: number, currency: Currency): number {
  return amount / 10 ** getCurrencyFractionDigits(currency)
}

export function convertMinorUnits(amount: number, rate: number): number {
  if (!Number.isFinite(rate) || rate < 0) throw new Error('匯率必須是非負數字')
  return Math.round(amount * rate)
}

export function convertAmountToMinorUnits(amountMinor: number, from: Currency, to: Currency, rate: number): number {
  if (!Number.isFinite(rate) || rate < 0) throw new Error('匯率必須是非負數字')
  const convertedAmount = fromMinorUnits(amountMinor, from) * rate
  return Math.round(convertedAmount * 10 ** getCurrencyFractionDigits(to))
}
