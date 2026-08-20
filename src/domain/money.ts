import type { Currency } from './types'

const decimalPlaces: Record<Currency, number> = { TWD: 0, KRW: 0, JPY: 0, USD: 2, HKD: 2 }

export function toMinorUnits(amount: string, currency: Currency): number {
  const value = Number(amount)
  if (!Number.isFinite(value) || value < 0) throw new Error('金額必須是非負數字')
  return Math.round(value * 10 ** decimalPlaces[currency])
}

export function fromMinorUnits(amount: number, currency: Currency): number {
  return amount / 10 ** decimalPlaces[currency]
}

export function convertMinorUnits(amount: number, rate: number): number {
  if (!Number.isFinite(rate) || rate < 0) throw new Error('匯率必須是非負數字')
  return Math.round(amount * rate)
}
