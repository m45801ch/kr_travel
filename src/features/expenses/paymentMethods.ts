import type { PaymentMethod } from '../../domain/types'

export type PaymentMethodId = PaymentMethod

export interface PaymentMethodOption {
  id: PaymentMethodId
  label: string
  description: string
}

export const paymentMethodOptions: PaymentMethodOption[] = [
  { id: 'cash', label: '現金', description: '紙鈔或硬幣' },
  { id: 'credit-card', label: '信用卡', description: '信用卡或簽帳卡' },
  { id: 'debit-card', label: '簽帳金融卡', description: 'Debit card' },
  { id: 'google-pay', label: 'Google Pay', description: 'Google 行動錢包' },
  { id: 'apple-pay', label: 'Apple Pay', description: 'Apple 行動錢包' },
  { id: 'samsung-pay', label: 'Samsung Pay', description: 'Samsung 行動錢包' },
  { id: 'line-pay', label: 'LINE Pay', description: 'LINE 行動支付' },
  { id: 'bank-transfer', label: '銀行轉帳', description: '網路銀行或 ATM' },
  { id: 'transit-card', label: '交通卡', description: 'T-money、Suica 等' },
  { id: 'qr-pay', label: 'QR Code 支付', description: '掃碼或電子支付' },
  { id: 'other', label: '其他', description: '其他付款方式' },
]

export function getPaymentMethodLabel(id?: string) {
  return paymentMethodOptions.find((option) => option.id === id)?.label ?? (id ? '其他' : '未填寫付款方式')
}

export function normalizePaymentMethod(id?: string): PaymentMethodId {
  return paymentMethodOptions.some((option) => option.id === id) ? id as PaymentMethodId : 'other'
}
