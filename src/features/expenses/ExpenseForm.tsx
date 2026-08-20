import { useMemo, useState } from 'react'
import type { Currency, Expense, ExpenseSplit, Member, SplitMode } from '../../domain/types'
import { toMinorUnits, convertMinorUnits } from '../../domain/money'
import { splitExpense, type SplitParticipant } from '../../domain/splitting'

export function ExpenseForm({ tripId, baseCurrency, members, onSave, onCancel }: { tripId: string; baseCurrency: Currency; members: Member[]; onSave: (expense: Expense, splits: ExpenseSplit[]) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>(baseCurrency)
  const [rate, setRate] = useState('1')
  const [category, setCategory] = useState('美食')
  const [payerId, setPayerId] = useState(members[0]?.id ?? '')
  const [splitMode, setSplitMode] = useState<SplitMode>('equal')
  const [selectedIds, setSelectedIds] = useState<string[]>(members.map((member) => member.id))
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const participants = useMemo<SplitParticipant[]>(() => selectedIds.map((memberId) => ({ memberId, amountMinor: splitMode === 'custom' ? Number(customAmounts[memberId] || 0) : undefined })), [customAmounts, selectedIds, splitMode])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amountMinor = toMinorUnits(amount, currency)
    const baseAmountMinor = convertMinorUnits(amountMinor, Number(rate))
    const expense: Expense = { id: crypto.randomUUID(), tripId, date: new Date().toISOString().slice(0, 10), amountMinor, currency, exchangeRateToBase: Number(rate), baseAmountMinor, category, payerId, splitMode, notes }
    onSave(expense, splitExpense(expense, participants))
  }

  return <div className="modal-backdrop"><form className="activity-form" onSubmit={submit}>
    <div className="form-heading"><div><p className="eyebrow">NEW EXPENSE</p><h2>新增支出</h2></div><button type="button" onClick={onCancel} aria-label="關閉">×</button></div>
    <div className="form-grid"><label>金額<input required inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></label><label>幣別<select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}><option>TWD</option><option>KRW</option><option>JPY</option><option>USD</option><option>HKD</option></select></label></div>
    <div className="form-grid"><label>換算匯率<input inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} /></label><label>類別<select value={category} onChange={(event) => setCategory(event.target.value)}><option>美食</option><option>交通</option><option>住宿</option><option>購物</option><option>景點</option><option>其他</option></select></label></div>
    <label>付款人<select value={payerId} onChange={(event) => setPayerId(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
    <div className="split-heading"><strong>分攤旅伴</strong><div className="split-toggle"><button className={splitMode === 'equal' ? 'is-active' : ''} type="button" onClick={() => setSplitMode('equal')}>平均</button><button className={splitMode === 'custom' ? 'is-active' : ''} type="button" onClick={() => setSplitMode('custom')}>自訂</button></div></div>
    <div className="member-checks">{members.map((member) => <label className="member-check" key={member.id}><input type="checkbox" checked={selectedIds.includes(member.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, member.id] : current.filter((id) => id !== member.id))} /><span>{member.name}</span>{splitMode === 'custom' && selectedIds.includes(member.id) && <input aria-label={`${member.name}分攤金額`} inputMode="numeric" value={customAmounts[member.id] ?? ''} onChange={(event) => setCustomAmounts((current) => ({ ...current, [member.id]: event.target.value }))} placeholder="金額" />}</label>)}</div>
    <label>備註<textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="記下這筆支出的細節" /></label>
    <div className="form-actions"><button type="button" className="button-secondary" onClick={onCancel}>取消</button><button type="submit" className="button-primary">儲存支出</button></div>
  </form></div>
}
