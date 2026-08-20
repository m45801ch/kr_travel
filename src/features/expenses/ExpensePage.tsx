import { Plus, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Expense, ExpenseSplit, Member } from '../../domain/types'
import { fromMinorUnits } from '../../domain/money'
import { calculateSettlement } from '../../domain/splitting'
import { ExpenseRepository } from '../../data/repositories/expenseRepository'
import { MemberRepository } from '../../data/repositories/memberRepository'
import { TripRepository } from '../../data/repositories/tripRepository'
import { BudgetCard } from './BudgetCard'
import { ExpenseForm } from './ExpenseForm'
import { SettlementSummary } from './SettlementSummary'

const tripRepository = new TripRepository()
const expenseRepository = new ExpenseRepository()
const memberRepository = new MemberRepository()

export function ExpensePage() {
  const [trip, setTrip] = useState<Awaited<ReturnType<TripRepository['getActiveTrip']>>>()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [splits, setSplits] = useState<ExpenseSplit[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('全部')

  const reload = async () => {
    const currentTrip = await tripRepository.getActiveTrip()
    if (!currentTrip) return
    let currentMembers = await memberRepository.listByTrip(currentTrip.id)
    if (!currentMembers.length) {
      currentMembers = [{ id: 'member-me', tripId: currentTrip.id, name: '我', color: '#ef8490', illustrationId: 'hanbok-woman', notes: '' }, { id: 'member-friend', tripId: currentTrip.id, name: '旅伴', color: '#8ba9d6', illustrationId: 'hanbok-man', notes: '' }]
      await Promise.all(currentMembers.map((member) => memberRepository.save(member)))
    }
    const currentExpenses = await expenseRepository.listByTrip(currentTrip.id)
    const currentSplits = (await Promise.all(currentExpenses.map((expense) => expenseRepository.listSplits(expense.id)))).flat()
    setTrip(currentTrip); setMembers(currentMembers); setExpenses(currentExpenses); setSplits(currentSplits)
  }

  useEffect(() => { void reload() }, [])
  const format = (amount: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: trip?.baseCurrency ?? 'TWD', maximumFractionDigits: 0 }).format(fromMinorUnits(amount, trip?.baseCurrency ?? 'TWD'))
  const spent = expenses.reduce((sum, expense) => sum + expense.baseAmountMinor, 0)
  const visibleExpenses = useMemo(() => category === '全部' ? expenses : expenses.filter((expense) => expense.category === category), [category, expenses])
  const settlements = calculateSettlement(expenses, members, splits)

  if (!trip) return <section className="page-preview"><p>請先建立旅程。</p></section>
  return <section className="expenses-page"><header className="page-header"><div><p className="eyebrow">TRAVEL BUDGET</p><h1>旅行記帳</h1><p>追蹤支出與旅程預算</p></div><button className="header-icon-button" type="button" aria-label="匯率設定"><Settings2 size={20} /></button></header><BudgetCard budget={trip.budgetMinor} spent={spent} format={format} /><div className="expense-toolbar"><select value={category} onChange={(event) => setCategory(event.target.value)}><option>全部</option><option>美食</option><option>交通</option><option>住宿</option><option>購物</option><option>景點</option><option>其他</option></select><button className="button-primary compact" type="button" onClick={() => setShowForm(true)}><Plus size={18} />新增支出</button></div><div className="expense-list">{visibleExpenses.length ? visibleExpenses.map((expense) => <article className="expense-row" key={expense.id}><div className="expense-category">{expense.category.slice(0, 1)}</div><div><strong>{expense.category}</strong><span>{expense.notes || `${expense.currency} 支出`}</span></div><b>{format(expense.baseAmountMinor)}</b></article>) : <div className="empty-activities">還沒有支出紀錄，先記下一筆旅費吧。</div>}</div><SettlementSummary settlements={settlements} members={members} format={format} />{showForm && <ExpenseForm tripId={trip.id} baseCurrency={trip.baseCurrency} members={members} onSave={async (expense, expenseSplits) => { await expenseRepository.save(expense, expenseSplits); setShowForm(false); await reload() }} onCancel={() => setShowForm(false)} />}</section>
}
