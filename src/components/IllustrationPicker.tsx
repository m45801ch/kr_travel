import { RotateCcw, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../data/db'
import { getIllustration, type IllustrationOption } from '../assets/illustrations'
import { illustrationCategories as staticCategories, type IllustrationCategory } from '../assets/illustrations'
import { mergeCatalog } from '../features/illustrations/illustrationStore'
import { illustrationCatalog as staticCatalog } from '../assets/illustrations'

interface IllustrationPickerProps {
  value: string
  onChange: (id: string) => void
  categories?: IllustrationCategory[]
}

export function IllustrationPicker({ value, onChange, categories }: IllustrationPickerProps) {
  const [category, setCategory] = useState<'全部' | IllustrationCategory>('全部')
  const overrides = useLiveQuery(() => db.illustrationOverrides.toArray(), [], [])
  const categoryConfigs = useLiveQuery(() => db.categoryConfigs.toArray(), [], [])
  const overridesMap = Object.fromEntries((overrides ?? []).map((o) => [o.id, o]))
  const categoryMap = Object.fromEntries((categoryConfigs ?? []).map((c) => [c.category, c]))
  const catalog = useMemo(() => mergeCatalog(staticCatalog, overridesMap as never), [overridesMap])
  const allowedBase = categories ?? staticCategories
  // Merge category labels with overrides
  const allowed = useMemo(() => allowedBase.map((c) => (categoryMap[c]?.label ? (categoryMap[c].label as IllustrationCategory) : c)), [allowedBase, categoryMap])
  // Map display label back to original category for filtering
  const categoryToOriginal = useMemo(() => {
    const m = new Map<string, IllustrationCategory>()
    for (const orig of staticCategories) {
      const display = categoryMap[orig]?.label ?? orig
      m.set(display, orig)
      m.set(orig, orig)
    }
    return m
  }, [categoryMap])
  const effectiveCategory = categoryToOriginal.get(category) ?? (category as IllustrationCategory)
  const options = useMemo(() => catalog.filter((item) => category === '全部' || item.category === effectiveCategory), [catalog, category, effectiveCategory])
  const selected = useMemo(() => catalog.find((i) => i.id === value) ?? getIllustration(value), [catalog, value])
  const randomize = () => onChange(options[Math.floor(Math.random() * options.length)]?.id ?? selected.id)

  return (
    <section className="illustration-picker" aria-label="選擇圖案">
      <div className="picker-preview" style={{ '--illustration-accent': selected.accent } as React.CSSProperties}>
        {selected.imageUrl ? <img className="picker-preview-image" src={selected.imageUrl} alt="" /> : <span className="picker-emoji" aria-hidden="true">{selected.emoji}</span>}
        <div><strong>{selected.label}</strong><span>目前選擇</span></div>
      </div>
      <div className="picker-tabs" role="tablist" aria-label="圖案分類">
        {['全部', ...allowed].map((item) => {
          const orig = categoryToOriginal.get(item) ?? (item as IllustrationCategory)
          const font = categoryMap[orig as string]?.fontFamily
          return <button className={category === item ? 'picker-tab is-active' : 'picker-tab'} key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item as '全部' | IllustrationCategory)} style={{ fontFamily: font || undefined }}>{item}</button>
        })}
      </div>
      <div className="illustration-grid">
        {options.map((option: IllustrationOption) => (
          <button className={value === option.id ? 'illustration-option is-selected' : 'illustration-option'} key={option.id} type="button" aria-label={option.label} onClick={() => onChange(option.id)}>
            <span className="illustration-art" style={{ '--illustration-accent': option.accent } as React.CSSProperties}>
              {option.imageUrl ? <img src={option.imageUrl} alt="" /> : option.emoji}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <div className="picker-actions">
        <button type="button" onClick={() => onChange('hanbok-woman')}><RotateCcw size={16} />重設</button>
        <button type="button" onClick={randomize}><Shuffle size={16} />隨機選擇</button>
      </div>
    </section>
  )
}
