import { describe, expect, it } from 'vitest'
import { getPaymentMethodLabel, normalizePaymentMethod, paymentMethodOptions } from './paymentMethods'

describe('payment methods', () => {
  it('provides the supported payment methods and labels', () => {
    expect(paymentMethodOptions).toHaveLength(11)
    expect(paymentMethodOptions.map((option) => option.id)).toContain('google-pay')
    expect(getPaymentMethodLabel('credit-card')).toBe('信用卡')
  })

  it('normalizes unknown values without crashing', () => {
    expect(normalizePaymentMethod('not-real')).toBe('other')
    expect(getPaymentMethodLabel()).toBe('未填寫付款方式')
    expect(getPaymentMethodLabel('not-real')).toBe('其他')
  })
})
