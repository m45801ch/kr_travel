import type { MapProvider, Settings } from '../../domain/types'

const providers: Array<{ id: MapProvider; name: string; description: string }> = [
  { id: 'google', name: 'Google 地圖', description: '適合全球地點與一般導航' },
  { id: 'naver', name: 'Naver Map', description: '韓國地點搜尋與導航較完整' },
  { id: 'apple', name: 'Apple 地圖', description: '適合 iPhone、iPad 與 Mac 使用者' },
]

export function MapProviderControls({ settings, onChange }: { settings: Settings; onChange: (settings: Settings) => void }) {
  const selected = settings.mapProvider ?? 'google'
  return (
    <section className="settings-card map-provider-card">
      <div>
        <h2>行程地圖服務</h2>
        <p>點擊行程卡片的地圖圖示時，使用你選擇的地圖服務開啟。</p>
      </div>
      <div className="map-provider-options" role="radiogroup" aria-label="行程地圖服務">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className={selected === provider.id ? 'map-provider-option is-selected' : 'map-provider-option'}
            role="radio"
            aria-checked={selected === provider.id}
            onClick={() => onChange({ ...settings, mapProvider: provider.id })}
          >
            <span><strong>{provider.name}</strong><small>{provider.description}</small></span>
            <b aria-hidden="true">{selected === provider.id ? '✓' : ''}</b>
          </button>
        ))}
      </div>
    </section>
  )
}
