import { ChevronDown, RotateCcw, Search, Shuffle, Star, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../data/db'
import { getIllustration, type IllustrationOption } from '../assets/illustrations'
import { illustrationCategories as staticCategories, type IllustrationCategory } from '../assets/illustrations'
import { mergeCatalog, ILLUSTRATION_PREFERENCES_ID, recordIllustrationUse, toggleIllustrationFavorite } from '../features/illustrations/illustrationStore'
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
  const pickerResetKey = `${categoryResetKey ?? ''}:${defaultCategory ?? ''}`
  const [userCategoryState, setUserCategoryState] = useState<{ resetKey: string; category: '全部' | IllustrationCategory } | null>(null)
  const [searchState, setSearchState] = useState({ resetKey: '', query: '' })
  const userCategory = userCategoryState?.resetKey === pickerResetKey ? userCategoryState.category : null
  const query = searchState.resetKey === pickerResetKey ? searchState.query : ''
  const overrides = useLiveQuery(() => db.illustrationOverrides.toArray(), [], [])
  const categoryConfigs = useLiveQuery(() => db.categoryConfigs.toArray(), [], [])
  const preferences = useLiveQuery(() => db.illustrationPreferences.get(ILLUSTRATION_PREFERENCES_ID), [], undefined)
  const overridesMap = Object.fromEntries((overrides ?? []).map((o) => [o.id, o]))
  const categoryMap = Object.fromEntries((categoryConfigs ?? []).map((c) => [c.category, c]))
  const catalog = useMemo(() => mergeCatalog(staticCatalog, overridesMap as never), [overridesMap])
  const favoriteIds = useMemo(() => preferences?.favoriteIds ?? [], [preferences])
  const recentIds = useMemo(() => preferences?.recentIds ?? [], [preferences])
  const allowedBase = categories ?? staticCategories
  const allowed = useMemo(() => allowedBase.map((c) => (categoryMap[c]?.label ? (categoryMap[c].label as IllustrationCategory) : c)), [allowedBase, categoryMap])
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
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const options = useMemo(() => catalog.filter((item) => {
    const matchesCategory = selectedCategory === '全部' || item.category === effectiveCategory
    const searchableText = `${item.label} ${item.id}`.toLocaleLowerCase()
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery))
  }), [catalog, selectedCategory, effectiveCategory, normalizedQuery])
  const favoriteOptions = useMemo(() => favoriteIds
    .map((id) => catalog.find((item) => item.id === id))
    .filter((item): item is IllustrationOption => Boolean(item)), [catalog, favoriteIds])
  const recentOptions = useMemo(() => recentIds
    .map((id) => catalog.find((item) => item.id === id))
    .filter((item): item is IllustrationOption => Boolean(item)), [catalog, recentIds])
  const selected = useMemo(() => catalog.find((i) => i.id === value) ?? getIllustration(value), [catalog, value])

  const selectIllustration = (id: string) => {
    onChange(id)
    void recordIllustrationUse(id)
  }

  const randomize = () => {
    const nextId = options[Math.floor(Math.random() * options.length)]?.id
    if (nextId) selectIllustration(nextId)
  }

  const renderOption = (option: IllustrationOption) => {
    const isFavorite = favoriteIds.includes(option.id)
    return (
      <div className={value === option.id ? 'illustration-option is-selected' : 'illustration-option'} key={option.id}>
        <button className="illustration-option-select" type="button" aria-label={option.label} onClick={() => selectIllustration(option.id)}>
          <span className="illustration-art" style={{ '--illustration-accent': option.accent } as React.CSSProperties}>
            <IllustrationArtwork illustration={option} decorative />
          </span>
          <span>{option.label}</span>
        </button>
        <button
          className={isFavorite ? 'illustration-favorite is-active' : 'illustration-favorite'}
          type="button"
          aria-label={`${isFavorite ? '取消最愛' : '加入最愛'}：${option.label}`}
          aria-pressed={isFavorite}
          onClick={() => void toggleIllustrationFavorite(option.id)}
        >
          <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
    )
  }

  const showPersonalSections = selectedCategory === '全部' && !normalizedQuery

  return (
    <section className="illustration-picker" aria-label="選擇圖案">
      <div className="picker-preview" style={{ '--illustration-accent': selected.accent } as React.CSSProperties}>
        <IllustrationArtwork illustration={selected} className={selected.imageUrl ? 'picker-preview-image' : 'picker-emoji'} decorative />
        {showLabel && <div><strong>{selected.label}</strong><span>目前選擇</span></div>}
      </div>
      <details className="illustration-picker-browser">
        <summary><span>瀏覽其他圖案</span><ChevronDown size={18} aria-hidden="true" /></summary>
        <div className="illustration-picker-browser-content">
          <div className="illustration-search-row">
            <Search size={16} aria-hidden="true" />
            <input aria-label="搜尋圖案" value={query} onChange={(e) => setSearchState({ resetKey: pickerResetKey, query: e.target.value })} placeholder="搜尋圖案名稱" />
            {query && <button type="button" className="illustration-search-clear" aria-label="清除搜尋" onClick={() => setSearchState({ resetKey: pickerResetKey, query: '' })}><X size={15} /></button>}
          </div>
          <div className="picker-tabs" role="tablist" aria-label="圖案分類">
            {['全部', ...allowed].map((item) => {
              const orig = categoryToOriginal.get(item) ?? (item as IllustrationCategory)
              const font = categoryMap[orig as string]?.fontFamily
              return <button className={selectedCategory === item ? 'picker-tab is-active' : 'picker-tab'} key={item} type="button" role="tab" aria-selected={selectedCategory === item} onClick={() => setUserCategoryState({ resetKey: pickerResetKey, category: item as '全部' | IllustrationCategory })} style={{ fontFamily: font || undefined }}>{item}</button>
            })}
          </div>

          {showPersonalSections && favoriteOptions.length > 0 && (
            <section className="illustration-featured-section" aria-label="我的最愛">
              <div className="illustration-section-heading"><strong>我的最愛</strong><span>{favoriteOptions.length}</span></div>
              <div className="illustration-grid">{favoriteOptions.map(renderOption)}</div>
            </section>
          )}
          {showPersonalSections && recentOptions.length > 0 && (
            <section className="illustration-featured-section" aria-label="最近使用">
              <div className="illustration-section-heading"><strong>最近使用</strong><span>{recentOptions.length}</span></div>
              <div className="illustration-grid">{recentOptions.map(renderOption)}</div>
            </section>
          )}

          {options.length > 0 ? (
            <div className="illustration-grid" aria-label={normalizedQuery ? '搜尋結果' : '圖案清單'}>{options.map(renderOption)}</div>
          ) : (
            <p className="illustration-empty" role="status">{normalizedQuery ? `找不到符合「${query.trim()}」的圖案。` : '此分類目前沒有可用圖案。'}</p>
          )}
          <div className="picker-actions">
            <button type="button" onClick={() => selectIllustration('hanbok-woman')}><RotateCcw size={16} />重設</button>
            <button type="button" onClick={randomize} disabled={options.length === 0}><Shuffle size={16} />隨機選擇</button>
          </div>
        </div>
      </details>
    </section>
  )
}
