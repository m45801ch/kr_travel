import { Pencil, Plus, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { currencyLabel } from '../../domain/currency'
import type { Currency, Expense, ExpenseSplit, Member } from '../../domain/types'
import { fromMinorUnits, toMinorUnits } from '../../domain/money'
import { calculateSettlement } from '../../domain/splitting'
import { ExpenseRepository } from '../../data/repositories/expenseRepository'
import { MemberRepository } from '../../data/repositories/memberRepository'
import { TripRepository } from '../../data/repositories/tripRepository'
import { BudgetCard } from './BudgetCard'
import { ExpenseForm } from './ExpenseForm'
import { SettlementSummary } from './SettlementSummary'
import transportIcon from '../../assets/expense-icons/transport-tile.png'
import foodIcon from '../../assets/expense-icons/food-tile.png'
import stayIcon from '../../assets/expense-icons/stay-tile.png'
import shoppingIcon from '../../assets/expense-icons/shopping-tile.png'
import attractionIcon from '../../assets/expense-icons/attraction-tile.png'
import otherIcon from '../../assets/expense-icons/other-tile.png'

const tripRepository = new TripRepository()
const expenseRepository = new ExpenseRepository()
const memberRepository = new MemberRepository()

const expenseCategoryIcons: Record<string, string> = {
  交通: transportIcon,
  美食: foodIcon,
  住宿: stayIcon,
  購物: shoppingIcon,
  景點: attractionIcon,
  其他: otherIcon,
}

export function ExpensePage() {
  const [trip, setTrip] = useState<Awaited<ReturnType<TripRepository['getActiveTrip']>>>()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [splits, setSplits] = useState<ExpenseSplit[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense>()
  const [category, setCategory] = useState('全部')
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState('')

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

  useEffect(() => {
    const reloadTimer = window.setTimeout(() => { void reload() }, 0)
    return () => window.clearTimeout(reloadTimer)
  }, [])
  const format = (amount: number) => formatCurrency(amount, trip?.baseCurrency ?? 'TWD')
  const spent = expenses.reduce((sum, expense) => sum + expense.baseAmountMinor, 0)
  const visibleExpenses = useMemo(() => category === '全部' ? expenses : expenses.filter((expense) => expense.category === category), [category, expenses])
  const settlements = calculateSettlement(expenses, members, splits)

  const startEditBudget = () => {
    if (!trip) return
    setBudgetDraft(String(fromMinorUnits(trip.budgetMinor, trip.baseCurrency)))
    setEditingBudget(true)
  }
  const saveBudget = async () => {
    if (!trip) return
    try {
      const nextBudget = toMinorUnits(budgetDraft, trip.baseCurrency)
      const nextTrip = { ...trip, budgetMinor: nextBudget }
      await tripRepository.saveTrip(nextTrip)
      setTrip(nextTrip)
      setEditingBudget(false)
    } catch {
      // ignore invalid input
    }
  }

  const saveExpense = async (expense: Expense, expenseSplits: ExpenseSplit[]) => {
    await expenseRepository.save(expense, expenseSplits)
    setShowForm(false)
    setEditingExpense(undefined)
    await reload()
  }

  const deleteExpense = async (expense: Expense) => {
    await expenseRepository.delete(expense.id)
    setShowForm(false)
    setEditingExpense(undefined)
    await reload()
  }

  const startNewExpense = () => {
    setEditingExpense(undefined)
    setShowForm(true)
  }

  const startEditingExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  if (!trip) return <section className="page-preview"><p>請先建立旅程。</p></section>
  return <section className="expenses-page"><header className="page-header themed-header themed-header-expenses"><div><p className="eyebrow">TRAVEL BUDGET</p><h1>旅行記帳</h1><p>追蹤支出與旅程預算</p></div><button className="header-icon-button" type="button" aria-label="匯率設定"><Settings2 size={20} /></button></header><BudgetCard budget={trip.budgetMinor} spent={spent} format={format} />{editingBudget ? <div className="budget-edit"><label>總預算<input value={budgetDraft} onChange={(e) => setBudgetDraft(e.target.value)} inputMode="decimal" placeholder="輸入金額" aria-label="總預算" /></label><div className="budget-edit-actions"><button className="button-primary" type="button" onClick={() => void saveBudget()}>儲存</button><button className="button-secondary" type="button" onClick={() => setEditingBudget(false)}>取消</button></div></div> : <button className="budget-edit-trigger" type="button" onClick={startEditBudget}><Pencil size={14} /> 設定總預算（目前 {format(trip.budgetMinor)}）</button>}<div className="expense-toolbar"><select value={category} onChange={(event) => setCategory(event.target.value)}><option>全部</option><option>美食</option><option>交通</option><option>住宿</option><option>購物</option><option>景點</option><option>其他</option></select><button className="button-primary compact" type="button" onClick={startNewExpense}><Plus size={18} />新增支出</button></div><div className="expense-list">{visibleExpenses.length ? visibleExpenses.map((expense) => <button className="expense-row" type="button" key={expense.id} onClick={() => startEditingExpense(expense)} aria-label={`編輯${expense.category}支出`}><div className="expense-category"><img src={expenseCategoryIcons[expense.category] ?? otherIcon} alt={`${expense.category}類別圖示`} /></div><div><strong>{expense.category}</strong><span>{expenseSummary(expense)}</span></div><b>{format(expense.baseAmountMinor)}</b></button>) : <div className="empty-activities">還沒有支出紀錄，先記下一筆旅費吧。</div>}</div><SettlementSummary settlements={settlements} members={members} format={format} />{showForm && <ExpenseForm tripId={trip.id} baseCurrency={trip.baseCurrency} members={members} initial={editingExpense} initialSplits={editingExpense ? splits.filter((split) => split.expenseId === editingExpense.id) : []} onSave={(expense, expenseSplits) => { void saveExpense(expense, expenseSplits) }} onDelete={(expense) => { void deleteExpense(expense) }} onCancel={() => { setShowForm(false); setEditingExpense(undefined) }} />}</section>
}

function formatCurrency(amountMinor: number, currency: Currency): string {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency, maximumFractionDigits: 2 }).format(fromMinorUnits(amountMinor, currency))
}

function expenseSummary(expense: Expense): string {
  const original = formatCurrency(expense.amountMinor, expense.currency)
  const converted = expense.conversionCurrency && typeof expense.convertedAmountMinor === 'number'
    ? ` → ${formatCurrency(expense.convertedAmountMinor, expense.conversionCurrency)}`
    : ` · ${currencyLabel(expense.currency)}`
  return expense.notes ? `${original}${converted} · ${expense.notes}` : `${original}${converted}`
}
