import type { Settings } from '../../domain/types'

const colors = ['#ef8490', '#7596cf', '#78bda7', '#b19bd4', '#f4c768']

export function ThemeControls({ settings, onChange }: { settings: Settings; onChange: (settings: Settings) => void }) {
  return <section className="settings-card"><h2>個人化外觀</h2><p>選一個陪你旅行的顏色</p><div className="theme-colors">{colors.map((color) => <button className={settings.themeColor === color ? 'theme-color is-selected' : 'theme-color'} key={color} type="button" style={{ background: color }} aria-label={`套用${color}主題`} onClick={() => onChange({ ...settings, themeColor: color })} />)}</div><label className="setting-row"><span><strong>深色模式</strong><small>夜晚使用更舒服</small></span><input type="checkbox" checked={settings.darkMode} onChange={(event) => onChange({ ...settings, darkMode: event.target.checked })} /></label><label className="setting-row"><span><strong>飄落特效</strong><small>選擇背景動態效果</small></span><input type="checkbox" checked={settings.effects} onChange={(event) => onChange({ ...settings, effects: event.target.checked })} /></label><label className="font-setting"><span>字體大小 <b>{Math.round(settings.fontScale * 16)}px</b></span><input type="range" min=".9" max="1.25" step=".05" value={settings.fontScale} onChange={(event) => onChange({ ...settings, fontScale: Number(event.target.value) })} /></label></section>
}
