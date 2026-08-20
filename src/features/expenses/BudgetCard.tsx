import { ArrowDownRight, WalletCards } from 'lucide-react'

export function BudgetCard({ budget, spent, format }: { budget: number; spent: number; format: (amount: number) => string }) {
  const remaining = Math.max(budget - spent, 0)
  const progress = budget ? Math.min(spent / budget * 100, 100) : 0
  return <section className="budget-card"><div className="budget-top"><span>總預算</span><span>已花費</span></div><div className="budget-values"><strong>{format(budget)}</strong><strong>{format(spent)}</strong></div><div className="budget-progress"><span style={{ width: `${progress}%` }} /></div><div className="budget-bottom"><span><ArrowDownRight size={17} />剩餘額度</span><strong>{format(remaining)}</strong></div><WalletCards className="budget-watermark" size={88} /></section>
}
