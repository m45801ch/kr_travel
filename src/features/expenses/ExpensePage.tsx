import { Plus, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { currencyLabel, getCurrencyFractionDigits } from '../../domain/currency'
import type { Currency, Expense, ExpenseSplit, Member } from '../../domain/types'
import { fromMinorUnits, toMinorUnits } from '../../domain/money'
import { calculateSettlement } from '../../domain/splitting'
import { ExpenseRepository } from '../../data/repositories/expenseRepository'
import { createSelfMember, isSelfMember, MemberRepository } from '../../data/repositories/memberRepository'
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
import customIcon from '../../assets/expense-icons/custom-tile.svg'
import { ThemeHeaderArt } from '../../components/ThemeHeaderArt'
import { getPaymentMethodLabel, normalizePaymentMethod, paymentMethodOptions } from './paymentMethods'
import { PaymentMethodSummary, type PaymentMethodFilter } from './PaymentMethodSummary'

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
  自定: customIcon,
}

export function ExpensePage() {
  const [trip, setTrip] = useState<Awaited<ReturnType<TripRepository['getActiveTrip']>>>()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [splits, setSplits] = useState<ExpenseSplit[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense>()
  const [category, setCategory] = useState('全部')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState('')

  const reload = async () => {
    const currentTrip = await tripRepository.getActiveTrip()
    if (!currentTrip) return
    const storedMembers = await memberRepository.listByTrip(currentTrip.id)
    const legacySelf = storedMembers.find(isSelfMember)
    const companions = storedMembers.filter((member) => !isSelfMember(member))
    const currentMembers = [createSelfMember(currentTrip.id, legacySelf), ...companions]
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
  const filterOptions = useMemo(() => {
    const base = ['美食', '交通', '住宿', '購物', '景點', '其他', '自定']
    const custom = Array.from(new Set(expenses.map((e) => e.category).filter((c) => !base.includes(c) && c !== '全部')))
    return ['全部', ...base, ...custom]
  }, [expenses])
  const activeCategory = filterOptions.includes(category) ? category : '全部'
  const categoryExpenses = useMemo(() => activeCategory === '全部' ? expenses : expenses.filter((expense) => expense.category === activeCategory), [activeCategory, expenses])
  const visibleExpenses = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    const searched = query ? categoryExpenses.filter((expense) => [expense.category, expense.notes, expense.date, getPaymentMethodLabel(expense.paymentMethod)].some((value) => value.toLocaleLowerCase().includes(query))) : categoryExpenses
    if (paymentMethodFilter === 'all') return searched
    if (paymentMethodFilter === 'unset') return searched.filter((expense) => !expense.paymentMethod)
    return searched.filter((expense) => expense.paymentMethod && normalizePaymentMethod(expense.paymentMethod) === paymentMethodFilter)
  }, [categoryExpenses, paymentMethodFilter, searchQuery])
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
    return <section className="expenses-page"><header className="page-header themed-header themed-header-expenses"><ThemeHeaderArt kind="budget" /><div>
<p className="eyebrow">TRAVEL BUDGET</p><h1>旅行記帳</h1><p>追蹤支出與旅程預算</p></div><button className="header-icon-button" type="button" aria-label="匯率設定"><Settings2 size={20} /></button></header><BudgetCard budget={trip.budgetMinor} spent={spent} format={format} onClick={startEditBudget} />{editingBudget && <div className="budget-edit"><label>總預算<input value={budgetDraft} onChange={(e) => setBudgetDraft(e.target.value)} inputMode="decimal" placeholder="輸入金額" aria-label="總預算" /></label><div className="budget-edit-actions"><button className="button-primary" type="button" onClick={() => void saveBudget()}>儲存</button><button className="button-secondary" type="button" onClick={() => setEditingBudget(false)}>取消</button></div></div>}<div className="expense-toolbar"><div className="expense-filters"><input className="expense-search" type="search" aria-label="搜尋支出" placeholder="搜尋支出、備註或日期" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /><select aria-label="依類別篩選" value={activeCategory} onChange={(event) => setCategory(event.target.value)}>{filterOptions.map((opt) => <option key={opt}>{opt}</option>)}</select><select aria-label="依付款方式篩選" value={paymentMethodFilter} onChange={(event) => setPaymentMethodFilter(toPaymentMethodFilter(event.target.value))}><option value="all">全部付款方式</option><option value="unset">未設定</option>{paymentMethodOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></div><button className="button-primary compact" type="button" onClick={startNewExpense}><Plus size={18} />新增支出</button></div><PaymentMethodSummary expenses={categoryExpenses} scopeLabel={activeCategory === '全部' ? '全部類別' : activeCategory} selectedFilter={paymentMethodFilter} format={format} onSelectFilter={setPaymentMethodFilter} /><div className="expense-list">{visibleExpenses.length ? visibleExpenses.map((expense) => <button className="expense-row" type="button" key={expense.id} onClick={() => startEditingExpense(expense)} aria-label={`編輯${expense.category}支出`}><div className="expense-category"><img src={expenseCategoryIcons[expense.category] ?? customIcon} alt={`${expense.category}類別圖示`} /></div><div><strong>{expense.category}</strong><span>{expenseSummary(expense)}</span>{expense.paymentMethod && <small className="expense-payment">付款：{getPaymentMethodLabel(expense.paymentMethod)}</small>}</div><b>{format(expense.baseAmountMinor)}</b></button>) : <div className="empty-activities">{expenses.length ? '目前的篩選條件沒有符合的支出。' : '還沒有支出紀錄，先記下一筆旅費吧。'}</div>}</div><SettlementSummary settlements={settlements} members={members} format={format} />{showForm && <ExpenseForm tripId={trip.id} baseCurrency={trip.baseCurrency} members={members} initial={editingExpense} initialSplits={editingExpense ? splits.filter((split) => split.expenseId === editingExpense.id) : []} onSave={(expense, expenseSplits) => { void saveExpense(expense, expenseSplits) }} onDelete={(expense) => { void deleteExpense(expense) }} onCancel={() => { setShowForm(false); setEditingExpense(undefined) }} />}</section>
}

function toPaymentMethodFilter(value: string): PaymentMethodFilter {
  if (value === 'all' || value === 'unset') return value
  return normalizePaymentMethod(value)
}

function formatCurrency(amountMinor: number, currency: Currency): string {
  const digits = getCurrencyFractionDigits(currency)
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(fromMinorUnits(amountMinor, currency))
}

function expenseSummary(expense: Expense): string {
  const original = formatCurrency(expense.amountMinor, expense.currency)
  const converted = expense.conversionCurrency && typeof expense.convertedAmountMinor === 'number'
    ? ` → ${formatCurrency(expense.convertedAmountMinor, expense.conversionCurrency)}`
    : ` · ${currencyLabel(expense.currency)}`
  return expense.notes ? `${original}${converted} · ${expense.notes}` : `${original}${converted}`
}
