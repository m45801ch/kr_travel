import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createCurrencyOption, type CurrencyOption } from '../../domain/currency'
import type { Currency } from '../../domain/types'

export function CurrencyPicker({ label, value, options, onChange, preferredCodes, disabled = false }: {
  label: string
  value: Currency
  options: CurrencyOption[]
  onChange: (currency: Currency) => void
  preferredCodes?: Currency[]
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const allOptions = useMemo(() => options.some((option) => option.code === value) ? options : [...options, createCurrencyOption(value)], [options, value])
  const selected = allOptions.find((option) => option.code === value) ?? createCurrencyOption(value)
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('zh-Hant-TW')
    if (!normalizedQuery && preferredCodes?.length) return preferredCodes.map((code) => allOptions.find((option) => option.code === code)).filter((option): option is CurrencyOption => Boolean(option))
    if (!normalizedQuery) return allOptions.slice(0, 10)
    return allOptions.filter((option) => `${option.code} ${option.label} ${option.name} ${option.symbol ?? ''}`.toLocaleLowerCase('zh-Hant-TW').includes(normalizedQuery)).slice(0, 10)
  }, [allOptions, preferredCodes, query])

  const chooseCurrency = (currency: Currency) => {
    onChange(currency)
    setQuery('')
    setIsOpen(false)
  }

  return <label className="currency-picker"><span>{label}</span><div className="currency-picker-control"><Search size={16} aria-hidden="true" /><input aria-label={label} value={isOpen ? query : selected.label} onFocus={() => { setIsOpen(true); setQuery('') }} onChange={(event) => { setIsOpen(true); setQuery(event.target.value) }} onBlur={() => window.setTimeout(() => setIsOpen(false), 120)} placeholder="輸入幣別、代碼或國家" disabled={disabled} autoComplete="off" aria-expanded={isOpen} aria-controls={`${label}-currency-options`} />{isOpen && <div className="currency-picker-menu" id={`${label}-currency-options`} role="listbox" aria-label={`${label}選項`}>{filtered.length ? filtered.map((option) => <button key={option.code} type="button" role="option" aria-selected={option.code === value} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseCurrency(option.code)}><strong>{option.label}</strong><span>{option.name}{option.symbol ? ` · ${option.symbol}` : ''}</span></button>) : <p>找不到符合的幣別。</p>}</div>}</div></label>
}
