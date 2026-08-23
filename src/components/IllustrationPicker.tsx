import { ChevronDown, RotateCcw, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../data/db'
import { getIllustration, type IllustrationOption } from '../assets/illustrations'
import { illustrationCategories as staticCategories, type IllustrationCategory } from '../assets/illustrations'
import { mergeCatalog } from '../features/illustrations/illustrationStore'
import { illustrationCatalog as staticCatalog } from '../assets/illustrations'
import { IllustrationArtwork } from './IllustrationArtwork'

interface IllustrationPickerProps {
  value: string
  onChange: (id: string) => void
  categories?: IllustrationCategory[]
  showLabel?: boolean
  defaultCategory?: IllustrationCategory
  categoryResetKey?: string | number
}

export function IllustrationPicker({ value, onChange, categories, showLabel = true, defaultCategory, categoryResetKey }: IllustrationPickerProps) {
  const [userCategory, setUserCategory] = useState<'全部' | IllustrationCategory | null>(null)
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
  const selectedCategory = userCategory ?? (categories?.length === 1 ? categories[0] : defaultCategory ?? '全部')
  const effectiveCategory = categoryToOriginal.get(selectedCategory) ?? (selectedCategory as IllustrationCategory)
  const options = useMemo(() => catalog.filter((item) => selectedCategory === '全部' || item.category === effectiveCategory), [catalog, selectedCategory, effectiveCategory])
  const selected = useMemo(() => catalog.find((i) => i.id === value) ?? getIllustration(value), [catalog, value])
  const randomize = () => onChange(options[Math.floor(Math.random() * options.length)]?.id ?? selected.id)

  useEffect(() => {
    setUserCategory(null)
  }, [categoryResetKey, defaultCategory])

  return (
    <section className="illustration-picker" aria-label="選擇圖案">
      <div className="picker-preview" style={{ '--illustration-accent': selected.accent } as React.CSSProperties}>
        <IllustrationArtwork illustration={selected} className={selected.imageUrl ? 'picker-preview-image' : 'picker-emoji'} decorative />
        {showLabel && <div><strong>{selected.label}</strong><span>目前選擇</span></div>}
      </div>
      <details className="illustration-picker-browser">
        <summary><span>瀏覽其他圖案</span><ChevronDown size={18} aria-hidden="true" /></summary>
        <div className="illustration-picker-browser-content">
          <div className="picker-tabs" role="tablist" aria-label="圖案分類">
            {['全部', ...allowed].map((item) => {
              const orig = categoryToOriginal.get(item) ?? (item as IllustrationCategory)
              const font = categoryMap[orig as string]?.fontFamily
              return <button className={selectedCategory === item ? 'picker-tab is-active' : 'picker-tab'} key={item} type="button" role="tab" aria-selected={selectedCategory === item} onClick={() => setUserCategory(item as '全部' | IllustrationCategory)} style={{ fontFamily: font || undefined }}>{item}</button>
            })}
          </div>
          <div className="illustration-grid">
            {options.map((option: IllustrationOption) => (
              <button className={value === option.id ? 'illustration-option is-selected' : 'illustration-option'} key={option.id} type="button" aria-label={option.label} onClick={() => onChange(option.id)}>
                <span className="illustration-art" style={{ '--illustration-accent': option.accent } as React.CSSProperties}>
                  <IllustrationArtwork illustration={option} decorative />
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <div className="picker-actions">
            <button type="button" onClick={() => onChange('hanbok-woman')}><RotateCcw size={16} />重設</button>
            <button type="button" onClick={randomize}><Shuffle size={16} />隨機選擇</button>
          </div>
        </div>
      </details>
    </section>
  )
}
