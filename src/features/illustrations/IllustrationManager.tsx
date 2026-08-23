import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, ChevronDown, Download, GripVertical, Pencil, Star, X } from 'lucide-react'
import { db } from '../../data/db'
import { illustrationCatalog as staticCatalog, illustrationCategories, type IllustrationCategory } from '../../assets/illustrations'
import { clearRecentIllustrations, ILLUSTRATION_PREFERENCES_ID, mergeCatalog, toggleIllustrationFavorite, upsertCategoryConfig, upsertIllustrationOverride } from './illustrationStore'
import { exportIllustrationSettings } from './illustrationSettings'

const fontOptions = [
  { label: '預設', value: '' },
  { label: '圓體', value: '"Zen Maru Gothic", "Noto Sans TC", sans-serif' },
  { label: '黑體', value: '"Noto Sans TC", sans-serif' },
  { label: '明體', value: '"Noto Serif TC", serif' },
  { label: '手寫', value: '"Kosugi Maru", cursive' },
  { label: '等寬', value: 'monospace' },
]

export function IllustrationManager() {
  const overrides = useLiveQuery(() => db.illustrationOverrides.toArray(), [], [])
  const categoryConfigs = useLiveQuery(() => db.categoryConfigs.toArray(), [], [])
  const preferences = useLiveQuery(() => db.illustrationPreferences.get(ILLUSTRATION_PREFERENCES_ID), [], undefined)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<IllustrationCategory | null>(null)
  const [categoryEditLabel, setCategoryEditLabel] = useState('')
  const [categoryFont, setCategoryFont] = useState('')
  const [exportStatus, setExportStatus] = useState('')

  const overridesMap = Object.fromEntries((overrides ?? []).map((o) => [o.id, o]))
  const categoryMap = Object.fromEntries((categoryConfigs ?? []).map((c) => [c.category, c]))
  const catalog = mergeCatalog(staticCatalog, overridesMap as never)
  const favoriteIds = preferences?.favoriteIds ?? []
  const recentIds = preferences?.recentIds ?? []

  // Group by category
  const grouped = new Map<IllustrationCategory, typeof catalog>()
  for (const cat of illustrationCategories) grouped.set(cat, [])
  for (const item of catalog) {
    const list = grouped.get(item.category as IllustrationCategory) ?? []
    list.push(item)
    grouped.set(item.category as IllustrationCategory, list)
  }
  // Include any custom categories from overrides
  for (const item of catalog) {
    if (!grouped.has(item.category as IllustrationCategory)) {
      grouped.set(item.category as IllustrationCategory, [item])
    }
  }

  const startEdit = (id: string, label: string) => {
    setEditingId(id)
    setEditLabel(label)
  }

  const saveLabel = async (id: string) => {
    const trimmed = editLabel.trim()
    if (!trimmed) return
    await upsertIllustrationOverride({ id, label: trimmed })
    setEditingId(null)
  }

  const moveCategory = async (id: string, newCat: IllustrationCategory) => {
    const current = overridesMap[id]
    await upsertIllustrationOverride({ id, label: current?.label, category: newCat })
  }

  const startCategoryEdit = (cat: IllustrationCategory) => {
    setEditingCategory(cat)
    setCategoryEditLabel(categoryMap[cat]?.label ?? cat)
    setCategoryFont(categoryMap[cat]?.fontFamily ?? '')
  }

  const saveCategory = async () => {
    if (!editingCategory) return
    const label = categoryEditLabel.trim() || editingCategory
    const fontFamily = categoryFont || undefined
    await upsertCategoryConfig({ category: editingCategory, label, fontFamily })
    setEditingCategory(null)
  }

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDrop = async (e: React.DragEvent, targetCategory: IllustrationCategory) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || dragId
    if (!id) return
    await moveCategory(id, targetCategory)
    setDragId(null)
  }

  const exportSettings = async () => {
    const blob = await exportIllustrationSettings()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `illustration-settings-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExportStatus('已匯出目前圖案分類、名稱與個人偏好。')
  }

  return (
    <details className="settings-card illustration-manager">
      <summary className="illustration-manager-summary">
        <span><strong>圖案分類管理</strong><small>調整分類、名稱與圖案排序</small></span>
        <ChevronDown size={20} aria-hidden="true" />
      </summary>
      <div className="illustration-manager-content">
        <p>拖曳卡片可移動至其他分類，點擊名稱可改名，分類標題可改字型與名稱（修正分類錯誤）。</p>
        <div className="illustration-manage-preferences" aria-label="圖案使用偏好統計">
          <span><strong>我的最愛</strong> {favoriteIds.length}</span>
          <span><strong>最近使用</strong> {recentIds.length}</span>
          {recentIds.length > 0 && <button type="button" onClick={() => void clearRecentIllustrations()}>清除最近使用</button>}
        </div>
        <button type="button" className="button-secondary" onClick={() => void exportSettings()}><Download size={16} />匯出目前圖案設定</button>
        {exportStatus && <p className="backup-status" role="status">{exportStatus}</p>}

        {Array.from(grouped.entries()).map(([category, items]) => {
          const config = categoryMap[category]
          const displayLabel = config?.label ?? category
          const isEditingCat = editingCategory === category
          return (
            <div
              key={category}
              className="illustration-category-section"
              onDragOver={onDragOver}
              onDrop={(e) => void onDrop(e, category)}
            >
              <div className="illustration-category-header" style={{ fontFamily: config?.fontFamily || undefined }}>
                {isEditingCat ? (
                  <div className="category-edit-row">
                    <input value={categoryEditLabel} onChange={(e) => setCategoryEditLabel(e.target.value)} placeholder="分類名稱" />
                    <select value={categoryFont} onChange={(e) => setCategoryFont(e.target.value)}>
                      {fontOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <button type="button" className="button-primary compact" onClick={() => void saveCategory()}><Check size={14} />儲存</button>
                    <button type="button" className="button-secondary compact" onClick={() => setEditingCategory(null)}><X size={14} />取消</button>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontFamily: config?.fontFamily || undefined }}>{displayLabel} <small>({items.length})</small></h3>
                    <button type="button" className="button-secondary compact" onClick={() => startCategoryEdit(category)}><Pencil size={12} />編輯分類</button>
                  </>
                )}
              </div>

              <div className="illustration-manager-grid">
                {items.map((item) => {
                  const isFavorite = favoriteIds.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`illustration-manage-card ${dragId === item.id ? 'is-dragging' : ''} ${isFavorite ? 'is-favorite' : ''}`}
                      draggable
                      onDragStart={(e) => onDragStart(e, item.id)}
                      onDragEnd={() => setDragId(null)}
                    >
                      <div className="illustration-manage-art" style={{ ['--illustration-accent' as string]: item.accent }}>
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.label} /> : <span>{item.emoji}</span>}
                        <button
                          type="button"
                          className={isFavorite ? 'illustration-manage-favorite is-active' : 'illustration-manage-favorite'}
                          aria-label={`${isFavorite ? '取消最愛' : '加入最愛'}：${item.label}`}
                          aria-pressed={isFavorite}
                          onClick={() => void toggleIllustrationFavorite(item.id)}
                        >
                          <Star size={13} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
                        </button>
                        <span className="drag-handle" aria-hidden="true"><GripVertical size={14} /></span>
                      </div>
                      {editingId === item.id ? (
                        <div className="illustration-edit-row">
                          <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') void saveLabel(item.id); if (e.key === 'Escape') setEditingId(null) }} />
                          <button type="button" className="button-primary compact" onClick={() => void saveLabel(item.id)}><Check size={12} /></button>
                          <button type="button" className="button-secondary compact" onClick={() => setEditingId(null)}><X size={12} /></button>
                        </div>
                      ) : (
                        <button type="button" className="illustration-label-button" onClick={() => startEdit(item.id, item.label)}>
                          <span>{item.label}</span><Pencil size={10} aria-hidden="true" />
                        </button>
                      )}
                      <select value={item.category} onChange={(e) => void moveCategory(item.id, e.target.value as IllustrationCategory)} aria-label="移動分類">
                        {illustrationCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </details>
  )
}
