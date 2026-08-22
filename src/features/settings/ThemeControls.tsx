import type { AppThemeId, Settings } from '../../domain/types'
import { themeCatalog } from './themes'

type ThemeColor = { value: string; label: string }

const themePalettes: Record<AppThemeId, ThemeColor[]> = {
  classic: [
    { value: '#ef8490', label: '櫻花珊瑚' },
    { value: '#7596cf', label: '晴空藍' },
    { value: '#78bda7', label: '薄荷綠' },
    { value: '#b19bd4', label: '薰衣草紫' },
    { value: '#f4c768', label: '奶油黃' },
  ],
  forest: [
    { value: '#5e9f78', label: '森林綠' },
    { value: '#3d805d', label: '松葉綠' },
    { value: '#7eb56e', label: '嫩葉綠' },
    { value: '#c9945a', label: '木屋棕' },
    { value: '#8ba9d6', label: '溪流藍' },
  ],
  storybook: [
    { value: '#4b9ed8', label: '晴空藍' },
    { value: '#2f78b7', label: '深海藍' },
    { value: '#8ed1f2', label: '雲朵藍' },
    { value: '#f6c759', label: '陽光黃' },
    { value: '#e46f4c', label: '冒險橘' },
  ],
  cyberpunk: [
    { value: '#ff4f9a', label: '霓虹桃紅' },
    { value: '#3de5d0', label: '電光青' },
    { value: '#b56cff', label: '雷射紫' },
    { value: '#ff7b54', label: '警示橘' },
    { value: '#8cf7ff', label: '冰晶藍' },
  ],
}

export function ThemeControls({ settings, onChange }: { settings: Settings; onChange: (settings: Settings) => void }) {
  const activeThemeId = settings.themeId ?? 'classic'
  const colors = themePalettes[activeThemeId]

  return (
    <section className="settings-card theme-settings-card">
      <div>
        <h2>主題</h2>
        <p>選擇一個配色與背景風格，行程、記帳、購物、準備和旅伴頁面會一起更新。</p>
      </div>
      <div className="theme-choice-grid" aria-label="主題風格">
        {themeCatalog.map((theme) => (
          <button
            className={activeThemeId === theme.id ? 'theme-choice is-selected' : 'theme-choice'}
            key={theme.id}
            type="button"
            onClick={() => onChange({ ...settings, themeId: theme.id, themeColor: theme.accent })}
            aria-pressed={activeThemeId === theme.id}
          >
            <span className={`theme-choice-preview theme-choice-preview--${theme.id}`} aria-hidden="true">
              <span className="theme-choice-preview-cloud" />
              <span className="theme-choice-preview-blocks" />
              <span className="theme-choice-preview-leaves" />
            </span>
            <span className="theme-choice-copy"><strong>{theme.name}</strong><small>{theme.description}</small></span>
            <span className="theme-choice-check" aria-hidden="true">{activeThemeId === theme.id ? '✓' : ''}</span>
          </button>
        ))}
      </div>
      <div className="theme-palette-section">
        <div className="theme-section-heading"><strong>現有配色</strong><span>{themeCatalog.find((theme) => theme.id === activeThemeId)?.name}專屬色彩</span></div>
        <div className="theme-colors">
          {colors.map(({ value, label }) => (
            <button
              className={settings.themeColor === value ? 'theme-color is-selected' : 'theme-color'}
              key={value}
              type="button"
              style={{ background: value }}
              aria-label={`套用${label}配色`}
              title={label}
              onClick={() => onChange({ ...settings, themeColor: value })}
            />
          ))}
        </div>
      </div>
      <label className="setting-row"><span><strong>飄落特效</strong><small>選擇背景動態效果</small></span><input type="checkbox" checked={settings.effects} onChange={(event) => onChange({ ...settings, effects: event.target.checked })} /></label>
      <label className="font-setting"><span>字體大小 <b>{Math.round(settings.fontScale * 16)}px</b></span><input type="range" min=".9" max="1.25" step=".05" value={settings.fontScale} onChange={(event) => onChange({ ...settings, fontScale: Number(event.target.value) })} /></label>
    </section>
  )
}
