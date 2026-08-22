import type { Expense } from '../../domain/types'
import { getPaymentMethodLabel, normalizePaymentMethod, type PaymentMethodId } from './paymentMethods'

export type PaymentMethodFilter = 'all' | 'unset' | PaymentMethodId

interface PaymentMethodSummaryProps {
  expenses: Expense[]
  scopeLabel: string
  selectedFilter: PaymentMethodFilter
  format: (amountMinor: number) => string
  onSelectFilter: (filter: PaymentMethodFilter) => void
}

interface PaymentStat {
  id: PaymentMethodFilter
  label: string
  count: number
  totalMinor: number
}

export function PaymentMethodSummary({ expenses, scopeLabel, selectedFilter, format, onSelectFilter }: PaymentMethodSummaryProps) {
  const stats = buildPaymentStats(expenses)
  const totalMinor = expenses.reduce((sum, expense) => sum + expense.baseAmountMinor, 0)

  return <section className="expense-payment-summary" aria-labelledby="expense-payment-summary-title">
    <div className="expense-payment-summary-heading">
      <div><p className="eyebrow">PAYMENT MIX</p><h2 id="expense-payment-summary-title">付款方式統計</h2></div>
      <div className="expense-payment-summary-total"><strong>{format(totalMinor)}</strong><small>{scopeLabel} · {expenses.length} 筆</small></div>
    </div>
    {stats.length ? <div className="payment-stat-grid">{stats.map((stat) => {
      const percentage = totalMinor ? Math.round(stat.totalMinor / totalMinor * 100) : 0
      const isActive = selectedFilter === stat.id
      return <button className={`payment-stat-card${isActive ? ' is-active' : ''}`} type="button" key={stat.id} aria-pressed={isActive} onClick={() => onSelectFilter(isActive ? 'all' : stat.id)}>
        <PaymentMethodArtwork id={stat.id} />
        <span>{stat.label}</span><strong>{format(stat.totalMinor)}</strong><small>{stat.count} 筆 · {percentage}%</small>
      </button>
    })}</div> : <p className="payment-stat-empty">目前範圍內還沒有支出資料。</p>}
    {stats.length > 0 && <p className="payment-stat-hint">點擊統計卡片即可快速篩選該付款方式。</p>}
  </section>
}

function PaymentMethodArtwork({ id }: { id: PaymentMethodFilter }) {
  const common = { className: 'payment-stat-art', viewBox: '0 0 160 100', 'aria-hidden': true }

  if (id === 'credit-card' || id === 'debit-card') return <svg {...common}><rect x="20" y="22" width="120" height="76" rx="12" /><path d="M20 42h120" /><rect x="34" y="56" width="28" height="18" rx="4" /><path d="M78 64h38" /></svg>
  if (id === 'qr-pay') return <svg {...common}><path d="M32 20h28v28H32zM100 20h28v28h-28zM32 72h28v28H32z" /><path d="M40 28h12v12H40zM108 28h12v12h-12zM40 80h12v12H40zM78 72h10v10H78zM96 72h10v10H96zM78 90h10v10H78zM114 86h14v14h-14z" /></svg>
  if (id === 'cash') return <svg {...common}><rect x="18" y="28" width="124" height="54" rx="8" /><circle cx="80" cy="55" r="14" /><path d="M34 42h12M114 68h12" /></svg>
  if (id === 'bank-transfer') return <svg {...common}><path d="m80 18 52 28H28zM36 52v30M60 52v30M84 52v30M108 52v30M22 88h116" /></svg>
  if (id === 'transit-card') return <svg {...common}><rect x="38" y="16" width="84" height="68" rx="12" /><path d="M54 68c12-18 40-18 52 0M62 54c6-8 20-8 26 0M76 39h8" /></svg>
  if (id === 'google-pay' || id === 'apple-pay' || id === 'samsung-pay' || id === 'line-pay') return <svg {...common}><rect x="36" y="12" width="88" height="78" rx="16" /><path d="M64 90h32" />{id === 'apple-pay' ? <path d="M80 43c-10-14-22-2-22 10 0 19 24 29 25 3 1 26 25 16 25-3 0-12-12-24-22-10z" /> : id === 'line-pay' ? <path d="M52 48c0-12 12-20 28-20s28 8 28 20-12 20-28 20l-12 8 2-10c-11-3-18-9-18-18z" /> : <circle cx="80" cy="50" r="18" />}</svg>
  return <svg {...common}><circle cx="80" cy="50" r="28" /><path d="M80 32v36M68 44h18a8 8 0 0 1 0 16H68" /></svg>
}

function buildPaymentStats(expenses: Expense[]): PaymentStat[] {
  const stats = new Map<PaymentMethodFilter, PaymentStat>()
  expenses.forEach((expense) => {
    const id: PaymentMethodFilter = expense.paymentMethod ? normalizePaymentMethod(expense.paymentMethod) : 'unset'
    const label = id === 'unset' ? '未設定' : getPaymentMethodLabel(id)
    const current = stats.get(id) ?? { id, label, count: 0, totalMinor: 0 }
    current.count += 1
    current.totalMinor += expense.baseAmountMinor
    stats.set(id, current)
  })
  return [...stats.values()].sort((a, b) => b.totalMinor - a.totalMinor || a.label.localeCompare(b.label, 'zh-Hant'))
}
