import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { currencyLabel, currencyOptions, getCurrencyFractionDigits, type CurrencyOption } from '../../domain/currency'
import { convertAmountToMinorUnits, toMinorUnits } from '../../domain/money'
import type { Currency, Expense, ExpenseSplit, Member, SplitMode } from '../../domain/types'
import { getLatestExchangeRate, getSupportedCurrencies } from '../../integrations/exchangeRates/frankfurter'
import { splitExpense, type SplitParticipant } from '../../domain/splitting'
import { CurrencyPicker } from './CurrencyPicker'

type RateStatus = 'idle' | 'loading' | 'success' | 'error'
type CurrencyStatus = 'idle' | 'loading' | 'success' | 'error'

const conversionPreferredCurrencies: Currency[] = ['JPY', 'KRW', 'USD', 'VND', 'CNY']

export function ExpenseForm({ tripId, baseCurrency, members, initial, initialSplits = [], onSave, onDelete, onCancel }: {
  tripId: string
  baseCurrency: Currency
  members: Member[]
  initial?: Expense
  initialSplits?: ExpenseSplit[]
  onSave: (expense: Expense, splits: ExpenseSplit[]) => void
  onDelete?: (expense: Expense) => void
  onCancel: () => void
}) {
  const isEditing = Boolean(initial)
  const [amount, setAmount] = useState(initial ? String(initial.amountMinor / 10 ** getCurrencyFractionDigits(initial.currency)) : '')
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'JPY')
  const [conversionCurrency, setConversionCurrency] = useState<Currency>(initial?.conversionCurrency ?? 'TWD')
  const [conversionRate, setConversionRate] = useState(String(initial?.conversionRate ?? initial?.exchangeRateToBase ?? 1))
  const [baseRate, setBaseRate] = useState(initial?.exchangeRateToBase ?? 1)
  const [rateDate, setRateDate] = useState<string>()
  const [rateStatus, setRateStatus] = useState<RateStatus>('idle')
  const [rateError, setRateError] = useState('')
  const [availableCurrencies, setAvailableCurrencies] = useState<CurrencyOption[]>(currencyOptions)
  const [currencyStatus, setCurrencyStatus] = useState<CurrencyStatus>('idle')
  const [currencyError, setCurrencyError] = useState('')
  const [category, setCategory] = useState(initial?.category ?? '美食')
  const [payerId, setPayerId] = useState(initial?.payerId ?? members[0]?.id ?? '')
  const [splitMode, setSplitMode] = useState<SplitMode>(initial?.splitMode ?? 'equal')
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSplits.length ? initialSplits.map((split) => split.memberId) : members.map((member) => member.id))
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(() => Object.fromEntries(initialSplits.map((split) => [split.memberId, String(split.amountMinor)])))
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [formError, setFormError] = useState('')
  const rateRequestId = useRef(0)
  const currencyRequestId = useRef(0)

  const participants = useMemo<SplitParticipant[]>(() => selectedIds.map((memberId) => ({ memberId, amountMinor: splitMode === 'custom' ? Number(customAmounts[memberId] || 0) : undefined })), [customAmounts, selectedIds, splitMode])
  const convertedPrice = useMemo(() => {
    const value = Number(amount)
    const rate = Number(conversionRate)
    if (!Number.isFinite(value) || value < 0 || !Number.isFinite(rate) || rate < 0) return ''
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: conversionCurrency, maximumFractionDigits: 2 }).format(value * rate)
  }, [amount, conversionCurrency, conversionRate])

  const loadCurrencies = useCallback(async () => {
    const requestId = ++currencyRequestId.current
    setCurrencyStatus('loading')
    setCurrencyError('')
    try {
      const loadedCurrencies = await getSupportedCurrencies()
      if (requestId !== currencyRequestId.current) return
      setAvailableCurrencies(loadedCurrencies)
      setCurrencyStatus('success')
    } catch (error) {
      if (requestId !== currencyRequestId.current) return
      setCurrencyStatus('error')
      setCurrencyError(error instanceof Error ? error.message : '目前無法載入支援幣別。')
    }
  }, [])

  const refreshRate = useCallback(async () => {
    const requestId = ++rateRequestId.current
    setRateStatus('loading')
    setRateError('')
    try {
      const [conversionSnapshot, baseSnapshot] = await Promise.all([
        getLatestExchangeRate(currency, conversionCurrency),
        getLatestExchangeRate(currency, baseCurrency),
      ])
      if (requestId !== rateRequestId.current) return
      setConversionRate(String(conversionSnapshot.rate))
      setBaseRate(baseSnapshot.rate)
      setRateDate(conversionSnapshot.date)
      setRateStatus('success')
    } catch (error) {
      if (requestId !== rateRequestId.current) return
      setRateStatus('error')
      setRateError(error instanceof Error ? error.message : '目前無法取得匯率，請稍後再試。')
    }
  }, [baseCurrency, conversionCurrency, currency])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void loadCurrencies() }, 0)
    return () => window.clearTimeout(loadTimer)
  }, [loadCurrencies])

  useEffect(() => {
    const isOriginalEditingPair = isEditing && initial?.currency === currency && (initial.conversionCurrency ?? baseCurrency) === conversionCurrency
    if (isOriginalEditingPair) return
    const refreshTimer = window.setTimeout(() => { void refreshRate() }, 0)
    return () => window.clearTimeout(refreshTimer)
  }, [baseCurrency, conversionCurrency, currency, initial, isEditing, refreshRate])


  const deleteExpense = () => {
    if (!initial || !onDelete) return
    if (window.confirm('確定要刪除這筆支出嗎？此操作無法復原。')) onDelete(initial)
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      if (rateStatus === 'loading') throw new Error('正在更新匯率，請稍候再儲存')
      const amountMinor = toMinorUnits(amount, currency)
      const parsedConversionRate = Number(conversionRate)
      if (!Number.isFinite(parsedConversionRate) || parsedConversionRate <= 0) throw new Error('請輸入大於 0 的換算匯率')
      if (!Number.isFinite(baseRate) || baseRate <= 0) throw new Error(`尚未取得換算為${currencyLabel(baseCurrency)}的匯率，請重新整理匯率後再儲存`)
      const convertedAmountMinor = convertAmountToMinorUnits(amountMinor, currency, conversionCurrency, parsedConversionRate)
      const baseAmountMinor = convertAmountToMinorUnits(amountMinor, currency, baseCurrency, baseRate)
      const expense: Expense = {
        id: initial?.id ?? crypto.randomUUID(),
        tripId,
        date: initial?.date ?? new Date().toISOString().slice(0, 10),
        amountMinor,
        currency,
        exchangeRateToBase: baseRate,
        baseAmountMinor,
        conversionCurrency,
        conversionRate: parsedConversionRate,
        convertedAmountMinor,
        category,
        payerId,
        splitMode,
        notes: notes.trim(),
      }
      onSave(expense, splitExpense(expense, participants))
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '無法儲存此筆支出')
    }
  }

  return <div className="modal-backdrop"><form className="activity-form" onSubmit={submit}>
    <div className="form-heading"><div><p className="eyebrow">{isEditing ? 'EDIT EXPENSE' : 'NEW EXPENSE'}</p><h2>{isEditing ? '編輯支出' : '新增支出'}</h2></div><button type="button" onClick={onCancel} aria-label="關閉">×</button></div>
    <div className="form-grid"><label>金額<input required inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></label><CurrencyPicker label="原始幣別" value={currency} options={availableCurrencies} onChange={setCurrency} disabled={currencyStatus === 'loading'} /></div>
    <div className="form-grid"><label>換算後價格<input aria-label="換算後價格" readOnly value={rateStatus === 'loading' ? '正在換算…' : convertedPrice || '—'} /></label><CurrencyPicker label="換算為" value={conversionCurrency} options={availableCurrencies} onChange={setConversionCurrency} preferredCodes={conversionPreferredCurrencies} disabled={currencyStatus === 'loading'} /></div>
    <div className="currency-load-status" aria-live="polite"><span>{currencyStatus === 'loading' ? '正在載入 Frankfurter 支援幣別…' : currencyStatus === 'success' ? `已載入 ${availableCurrencies.length} 種可搜尋幣別。` : currencyStatus === 'error' ? `${currencyError}，目前顯示常用幣別。` : '可搜尋幣別名稱、中文名稱、代碼或符號。'}</span><button className="button-secondary compact" type="button" onClick={() => void loadCurrencies()} disabled={currencyStatus === 'loading'}>{currencyStatus === 'loading' ? '載入中…' : '重新載入幣別'}</button></div>
    <div className="rate-panel" aria-live="polite"><div><span>自動匯率</span><strong>1 {currency} = {conversionRate || '—'} {conversionCurrency}</strong><small>換算後價格會隨金額與目標幣別自動更新。</small></div><button className="button-secondary compact" type="button" onClick={() => void refreshRate()} disabled={rateStatus === 'loading'}>{rateStatus === 'loading' ? '更新中…' : '更新最新匯率'}</button><p className={rateStatus === 'error' ? 'rate-message is-error' : 'rate-message'}>{rateStatus === 'loading' ? '正在取得最新可用匯率…' : rateStatus === 'error' ? rateError : rateDate ? `資料日期：${rateDate}` : isEditing ? '保留此筆記錄原本的匯率。' : '將自動取得最新可用匯率。'}</p></div>
    {conversionCurrency !== baseCurrency && <p className="base-rate-note">旅行預算會另以 1 {currency} = {baseRate} {baseCurrency} 計入，結算幣別為{currencyLabel(baseCurrency)}。</p>}
    <div className="form-grid"><label>類別<select value={category} onChange={(event) => setCategory(event.target.value)}><option>美食</option><option>交通</option><option>住宿</option><option>購物</option><option>景點</option><option>其他</option></select></label><label>付款人<select value={payerId} onChange={(event) => setPayerId(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label></div>
    <div className="split-heading"><strong>分攤旅伴</strong><div className="split-toggle"><button className={splitMode === 'equal' ? 'is-active' : ''} type="button" onClick={() => setSplitMode('equal')}>平均</button><button className={splitMode === 'custom' ? 'is-active' : ''} type="button" onClick={() => setSplitMode('custom')}>自訂</button></div></div>
    <div className="member-checks">{members.map((member) => <label className="member-check" key={member.id}><input type="checkbox" checked={selectedIds.includes(member.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, member.id] : current.filter((id) => id !== member.id))} /><span>{member.name}</span>{splitMode === 'custom' && selectedIds.includes(member.id) && <input aria-label={`${member.name}分攤金額`} inputMode="numeric" value={customAmounts[member.id] ?? ''} onChange={(event) => setCustomAmounts((current) => ({ ...current, [member.id]: event.target.value }))} placeholder="金額" />}</label>)}</div>
    <label>備註<textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="記下這筆支出的細節" /></label>
    {formError && <p className="form-error" role="alert">{formError}</p>}
    <div className="form-actions"><button type="button" className="button-secondary" onClick={onCancel}>取消</button><button type="submit" className="button-primary" disabled={rateStatus === 'loading'}>{isEditing ? '儲存修改' : '儲存支出'}</button></div>
    {isEditing && onDelete && <button className="button-danger delete-expense-button" type="button" onClick={deleteExpense}>刪除這筆支出</button>}
  </form></div>
}
