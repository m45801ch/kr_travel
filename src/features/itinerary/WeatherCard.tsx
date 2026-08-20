import { Cloud, CloudRain, RefreshCw, Sun, Wind } from 'lucide-react'
import type { WeatherSnapshot } from '../../domain/types'

function WeatherIcon({ code }: { code: number }) {
  if (code >= 51) return <CloudRain aria-hidden="true" size={34} />
  if (code === 0 || code === 1) return <Sun aria-hidden="true" size={34} />
  if (code === 45 || code === 48) return <Wind aria-hidden="true" size={34} />
  return <Cloud aria-hidden="true" size={34} />
}

export function WeatherCard({ weather, loading, onRefresh }: { weather?: WeatherSnapshot & { isStale?: boolean; updatedAt?: string }; loading: boolean; onRefresh: () => void }) {
  return <section className="weather-card">
    <div className="weather-icon"><WeatherIcon code={weather?.weatherCode ?? 3} /></div>
    <div className="weather-reading">
      <strong>{weather ? `${weather.temperatureMax}°` : '--°'}</strong>
      <span>／ {weather ? `${weather.temperatureMin}°` : '--°'}</span>
      <small>{weather?.isStale ? '上次更新資料' : weather?.description ?? '等待天氣資料'}</small>
    </div>
    <div className="weather-place"><button type="button" onClick={onRefresh} aria-label="更新天氣"><RefreshCw className={loading ? 'spin' : ''} size={19} /></button><strong>{weather?.locationName ?? '目的地天氣'}</strong><small>{weather?.updatedAt ? `更新於 ${new Date(weather.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}` : '連線後自動更新'}</small></div>
  </section>
}
