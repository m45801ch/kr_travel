import { ArrowDownRight, WalletCards } from 'lucide-react'

export function BudgetCard({ budget, spent, format, onClick }: { budget: number; spent: number; format: (amount: number) => string; onClick?: () => void }) {
  const remaining = Math.max(budget - spent, 0)
  const progress = budget ? Math.min(spent / budget * 100, 100) : 0
  const content = <><div className="budget-top"><span>總預算</span><span>已花費</span></div><div className="budget-values"><strong>{format(budget)}</strong><strong>{format(spent)}</strong></div><div className="budget-progress"><span style={{ width: `${progress}%` }} /></div><div className="budget-bottom"><span><ArrowDownRight size={17} />剩餘額度</span><strong>{format(remaining)}</strong></div><WalletCards className="budget-watermark" size={88} /></>
  if (onClick) {
    return <button type="button" className="budget-card budget-card--clickable" onClick={onClick} aria-label="設定總預算">{content}</button>
  }
  return <section className="budget-card">{content}</section>
}
