import { ChevronDown, ChevronUp, Cloud, CloudRain, Moon, Search, Snowflake, Sun, Wind } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import type { WeatherSnapshot } from '../../domain/types'
import { WORLD_COUNTRIES } from './worldLocations'

function isSnowCode(code: number): boolean {
  return (code >= 71 && code <= 77) || (code >= 85 && code <= 86)
}

function isRainCode(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
}

function WeatherIcon({ code, size = 34, isNight = false }: { code: number; size?: number; isNight?: boolean }) {
  if (isSnowCode(code)) return <Snowflake aria-hidden="true" size={size} />
  if (isRainCode(code)) return <CloudRain aria-hidden="true" size={size} />
  if (code === 0 || code === 1) return isNight ? <Moon aria-hidden="true" size={size} /> : <Sun aria-hidden="true" size={size} />
  if (code === 45 || code === 48) return <Wind aria-hidden="true" size={size} />
  return <Cloud aria-hidden="true" size={size} />
}

function weatherTheme(code: number): 'sun' | 'cloud' | 'rain' | 'snow' | 'fog' {
  if (isSnowCode(code)) return 'snow'
  if (isRainCode(code)) return 'rain'
  if (code === 0 || code === 1) return 'sun'
  if (code === 45 || code === 48) return 'fog'
  return 'cloud'
}

function weatherNarrative(code: number): string {
  if (code === 0) return '晴朗無雲，適合戶外散步與拍照'
  if (code === 1) return '大致晴朗，午後可能轉多雲'
  if (code === 45 || code === 48) return '薄霧瀰漫，能見度較低'
  if (code >= 95) return '雷雨發展中，請避開空曠地區並留意雷聲'
  if (code >= 80 && code <= 82) return '短暫陣雨，出門記得攜帶雨具'
  if (isSnowCode(code)) return '低溫有雪，留意保暖與路況'
  if (code >= 66) return '冰雨或雨夾雪，請留意路面濕滑'
  if (code >= 61) return '降雨持續，外出記得攜帶雨具'
  if (code >= 56) return '凍雨或霧雨，路面可能濕滑'
  if (code >= 51) return '細雨綿綿，路面微濕'
  return '多雲時晴，適合城市漫步'
}

function weatherAdvice(weather?: WeatherSnapshot): { icon: string; text: string } | null {
  if (!weather) return null
  const code = weather.weatherCode
  const max = weather.temperatureMax
  const min = weather.temperatureMin
  if (isSnowCode(code) && max > 10) return null
  if (isSnowCode(code)) {
    if (max <= 2) return { icon: '🧣', text: `低溫 ${min}°–${max}° 有雪，注意保暖與路面結冰` }
    return { icon: '❄️', text: `有降雪可能 ${min}°–${max}°，留意保暖` }
  }
  if (isRainCode(code)) return { icon: '☂️', text: `今日有雨（${min}°–${max}°），外出記得帶雨具` }
  if (code === 0 || code === 1) {
    if (max >= 30) return { icon: '🧴', text: `晴朗高溫 ${max}°，注意防曬與多補水` }
    if (max >= 26) return { icon: '☀️', text: `天氣晴朗 ${max}°，適合戶外活動` }
    return { icon: '☀️', text: `晴朗舒適 ${max}°，把握好天氣出門走走` }
  }
  if (code === 45 || code === 48) return { icon: '🚗', text: '薄霧影響能見度，出行請放慢' }
  if (max <= 5) return { icon: '🧣', text: `氣溫偏低 ${min}°–${max}°，外出加件外套` }
  if (max >= 32) return { icon: '🥤', text: `高溫 ${max}°，注意防暑` }
  return null
}

function formatLocalTime(now: Date, timezone?: string, longitude?: number): string {
  if (timezone) {
    try {
      return new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(now)
    } catch {}
  }
  if (longitude != null) {
    const localMillis = now.getTime() + (longitude / 15) * 60 * 60 * 1000
    return new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(new Date(localMillis))
  }
  return new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
}

type WeatherCardProps = {
  weather?: WeatherSnapshot & { isStale?: boolean; updatedAt?: string }
  error?: string
  loading: boolean
  location: string
  countryCode?: string
  cityQuery?: string
  latitude?: number
  longitude?: number
  onSaveLocation: (selection: { location: string; countryCode: string; cityQuery: string; latitude?: number; longitude?: number }) => void
  onRefresh: () => void
}

export function WeatherCard({ weather, error, loading, location, countryCode, cityQuery, longitude, onSaveLocation, onRefresh }: WeatherCardProps) {
  const normalize = (value: string) => value.replace(/臺/g, '台').toLocaleLowerCase()
  const cityMatchesLocation = (cityName: string, loc: string) => {
    const nCity = normalize(cityName)
    const nLoc = normalize(loc)
    return nCity === nLoc || nCity === nLoc.replace(/市$/, '') || nLoc === `${nCity}市`
  }
  const currentCountry = useMemo(() => WORLD_COUNTRIES.find((country) => country.code === countryCode) ?? WORLD_COUNTRIES.find((country) => country.cities.some((city) => cityMatchesLocation(city.name, location))), [countryCode, location])
  const currentCity = useMemo(() => currentCountry?.cities.find((city) => city.query === cityQuery || cityMatchesLocation(city.name, location)) ?? currentCountry?.cities[0], [cityQuery, currentCountry, location])
  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState(currentCountry?.code ?? '')
  const [selectedCityName, setSelectedCityName] = useState(currentCity?.name ?? '')
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [onlineHits, setOnlineHits] = useState<SearchHit[]>([])
  const [onlineSearching, setOnlineSearching] = useState(false)
  const [geocodingProvider, setGeocodingProvider] = useState<'open-meteo' | 'nominatim'>(() => {
    const storage = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function' ? localStorage : undefined
    const saved = storage?.getItem('geocodingProvider') ?? null
    return saved === 'open-meteo' ? 'open-meteo' : 'nominatim'
  })
  useEffect(() => {
    try { localStorage.setItem('geocodingProvider', geocodingProvider) } catch {}
  }, [geocodingProvider])

  useEffect(() => {
    if (currentCountry?.code) setSelectedCountryCode(currentCountry.code)
  }, [currentCountry?.code])
  useEffect(() => {
    if (currentCity?.name) setSelectedCityName(currentCity.name)
  }, [currentCity?.name])

  const selectedCountry = WORLD_COUNTRIES.find((country) => country.code === selectedCountryCode) ?? currentCountry
  const isCustomCity = Boolean(selectedCountry && selectedCityName && !selectedCountry.cities.some((city) => city.name === selectedCityName))
  const filteredCountries = useMemo(() => {
    const keyword = normalize(query.trim())
    if (!keyword) return WORLD_COUNTRIES
    return WORLD_COUNTRIES.filter((country) => normalize(country.name).includes(keyword))
  }, [query])
  const cityOptions = useMemo(() => {
    if (!selectedCountry) return [] as typeof WORLD_COUNTRIES[number]['cities']
    const base = selectedCountry.cities
    if (!isCustomCity) return base
    return [...base, { name: selectedCityName, query: selectedCityName } as (typeof base)[number]]
  }, [isCustomCity, selectedCityName, selectedCountry])

  type SearchHit = { key: string; label: string; kind: 'country' | 'city'; countryCode: string; cityQuery?: string; cityName?: string; latitude?: number; longitude?: number }
  const staticHits = useMemo<SearchHit[]>(() => {
    const keyword = normalize(query.trim())
    if (!keyword) return []
    const hits: SearchHit[] = []
    for (const country of WORLD_COUNTRIES) {
      if (normalize(country.name).includes(keyword)) hits.push({ key: `country:${country.code}`, label: country.name, kind: 'country', countryCode: country.code })
      for (const city of country.cities) {
        if (normalize(city.name).includes(keyword) || city.query.toLocaleLowerCase().includes(keyword)) hits.push({ key: `city:${country.code}:${city.query}:${city.name}`, label: `${city.name}（${country.name}）`, kind: 'city', countryCode: country.code, cityQuery: city.query, cityName: city.name })
      }
    }
    return hits.slice(0, 12)
  }, [query])
  const searchHits = useMemo<SearchHit[]>(() => {
    if (query.trim().length === 0) return []
    if (onlineHits.length > 0 || onlineSearching) {
      const merged = new Map<string, SearchHit>()
      for (const hit of onlineHits) merged.set(hit.key, hit)
      for (const hit of staticHits) if (!merged.has(hit.key)) merged.set(hit.key, hit)
      return Array.from(merged.values()).slice(0, 12)
    }
    return staticHits
  }, [onlineHits, staticHits, query, onlineSearching])

  useEffect(() => {
    const keyword = query.trim()
    if (keyword.length < 2) {
      setOnlineHits([])
      setOnlineSearching(false)
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setOnlineSearching(true)
      try {
        let hits: SearchHit[] = []
        if (geocodingProvider === 'nominatim') {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(keyword)}&format=json&addressdetails=1&accept-language=zh&limit=8`
          const response = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'zh-TW,zh;q=0.9' } as HeadersInit })
          if (!response.ok) throw new Error('nominatim failed')
          const data = (await response.json()) as Array<{ place_id: number; display_name: string; lat: string; lon: string; address?: { country_code?: string; country?: string; city?: string; town?: string; village?: string; state?: string } }>
          const seen = new Set<string>()
          for (const result of data) {
            const code = (result.address?.country_code ?? '').toUpperCase()
            if (!code) continue
            const rawName = result.address?.city ?? result.address?.town ?? result.address?.village ?? result.display_name.split(',')[0].trim()
            const cityName = rawName
            const dedupKey = `${code}:${normalize(cityName)}`
            if (seen.has(dedupKey)) continue
            seen.add(dedupKey)
            const country = WORLD_COUNTRIES.find((item) => item.code === code)
            const countryName = country?.name ?? result.address?.country ?? code
            const lat = Number.parseFloat(result.lat)
            const lon = Number.parseFloat(result.lon)
            hits.push({ key: `nominatim:${result.place_id}:${code}:${cityName}`, label: `${cityName}（${countryName}）`, kind: 'city' as const, countryCode: code, cityQuery: cityName, cityName, latitude: Number.isFinite(lat) ? lat : undefined, longitude: Number.isFinite(lon) ? lon : undefined })
          }
        } else {
          const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(keyword)}&count=8&language=zh&format=json`
          const response = await fetch(url, { signal: controller.signal })
          if (!response.ok) throw new Error('geocoding failed')
          const data = (await response.json()) as { results?: Array<{ id: number; name: string; latitude: number; longitude: number; country_code: string; country: string; admin1?: string }> }
          hits = (() => {
            const seen = new Set<string>()
            const deduped: SearchHit[] = []
            for (const result of data.results ?? []) {
              const code = result.country_code
              const dedupKey = `${code}:${normalize(result.name)}`
              if (seen.has(dedupKey)) continue
              seen.add(dedupKey)
              const country = WORLD_COUNTRIES.find((item) => item.code === code)
              const countryName = country?.name ?? result.country ?? code
              deduped.push({ key: `online:${result.id}:${code}:${result.name}`, label: `${result.name}（${countryName}）`, kind: 'city' as const, countryCode: code, cityQuery: result.name, cityName: result.name, latitude: result.latitude, longitude: result.longitude })
            }
            return deduped
          })()
          if (hits.length === 0 && /[^\x00-\x7F]/.test(keyword)) {
            const normalizedKeyword = normalize(keyword)
            let englishAlias: string | undefined
            for (const country of WORLD_COUNTRIES) {
              for (const city of country.cities) {
                if (normalize(city.name) === normalizedKeyword) { englishAlias = city.query; break }
              }
              if (englishAlias) break
            }
            if (englishAlias) {
              const url2 = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(englishAlias)}&count=8&format=json`
              const response2 = await fetch(url2, { signal: controller.signal })
              if (response2.ok) {
                const data2 = (await response2.json()) as { results?: Array<{ id: number; name: string; latitude: number; longitude: number; country_code: string; country: string; admin1?: string }> }
                const hits2: SearchHit[] = (() => {
                  const seen = new Set<string>()
                  const deduped: SearchHit[] = []
                  for (const result of data2.results ?? []) {
                    const code = result.country_code
                    const dedupKey = `${code}:${normalize(result.name)}`
                    if (seen.has(dedupKey)) continue
                    seen.add(dedupKey)
                    const country = WORLD_COUNTRIES.find((item) => item.code === code)
                    const countryName = country?.name ?? result.country ?? code
                    deduped.push({ key: `online:${result.id}:${code}:${result.name}`, label: `${result.name}（${countryName}）`, kind: 'city' as const, countryCode: code, cityQuery: result.name, cityName: result.name, latitude: result.latitude, longitude: result.longitude })
                  }
                  return deduped
                })()
                if (hits2.length > 0) hits = hits2
              }
            }
          }
        }
        if (!controller.signal.aborted) setOnlineHits(hits)
      } catch {
        if (!controller.signal.aborted) setOnlineHits([])
      } finally {
        if (!controller.signal.aborted) setOnlineSearching(false)
      }
    }, 300)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, geocodingProvider])

  const pickHit = (hit: SearchHit) => {
    if (hit.kind === 'country') {
      changeCountry(hit.countryCode)
    } else {
      setSelectedCountryCode(hit.countryCode)
      setSelectedCityName(hit.cityName ?? '')
      if (hit.latitude != null && hit.longitude != null) setSelectedCoords({ latitude: hit.latitude, longitude: hit.longitude })
      else setSelectedCoords(null)
    }
    setQuery('')
    setOnlineHits([])
  }

  const changeCountry = (nextCountryCode: string) => {
    setSelectedCountryCode(nextCountryCode)
    const nextCountry = WORLD_COUNTRIES.find((country) => country.code === nextCountryCode)
    setSelectedCityName(nextCountry?.cities[0]?.name ?? '')
    setSelectedCoords(null)
  }
  const saveLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextCountry = WORLD_COUNTRIES.find((country) => country.code === selectedCountryCode)
    if (!nextCountry) return
    const matchedCity = nextCountry.cities.find((city) => city.name === selectedCityName)
    const cityName = matchedCity?.name ?? selectedCityName
    const cityQuery = matchedCity?.query ?? selectedCityName
    if (!cityName) return
    const coords = selectedCoords ?? (matchedCity ? undefined : undefined)
    if (coords) onSaveLocation({ location: cityName, countryCode: nextCountry.code, cityQuery, latitude: coords.latitude, longitude: coords.longitude })
    else onSaveLocation({ location: cityName, countryCode: nextCountry.code, cityQuery })
    setLocationPickerOpen(false)
  }

  const theme = weatherTheme(weather?.weatherCode ?? 3)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const localTime = formatLocalTime(currentTime, weather?.timezone, longitude)
  const isNight = useMemo(() => {
    let h = currentTime.getHours()
    if (weather?.timezone) {
      try {
        h = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: weather.timezone }).format(currentTime)) % 24
      } catch {}
    } else if (longitude != null) {
      const utcHour = currentTime.getUTCHours() + currentTime.getUTCMinutes() / 60
      h = (utcHour + longitude / 15 + 24) % 24
    }
    return h < 6 || h >= 18
  }, [currentTime, longitude, weather?.timezone])
  const narrative = weather ? weatherNarrative(weather.weatherCode) : '等待天氣資料，選擇地點後按更新'
  const advice = weatherAdvice(weather)
  const refreshFromCard = (event: MouseEvent<HTMLElement>) => {
    const target = event.target
    if (target instanceof HTMLElement && target.closest('button, input, select, textarea, a, summary, label')) return
    if (!loading) onRefresh()
  }

  return <section className={`weather-card weather-card--${theme} ${isNight ? 'weather-card--night' : ''}`} onClick={refreshFromCard}>
    <div className="weather-hero">
      <div className="weather-hero-sky" aria-hidden="true">
        <span className="weather-sky-glow" />
        {isNight && <span className="weather-stars">✦　·　✧　·　✦　·　✧</span>}
        {theme === 'sun' && !isNight && <span className="weather-bg-icon" aria-hidden="true"><Sun size={140} /></span>}
        {theme === 'sun' && isNight && <span className="weather-bg-icon" aria-hidden="true"><Moon size={130} /></span>}
        {theme === 'cloud' && <span className="weather-bg-icon weather-bg-icon--cloud" aria-hidden="true"><Cloud size={130} /></span>}
        {theme === 'rain' && <><span className="weather-bg-icon weather-bg-icon--rain" aria-hidden="true"><CloudRain size={140} /></span><span className="weather-rain-lines" /></>}
        {theme === 'snow' && <span className="weather-bg-icon" aria-hidden="true"><Cloud size={120} /></span>}
        {theme === 'fog' && <span className="weather-bg-icon" aria-hidden="true"><Wind size={120} /></span>}
      </div>
      <div className="weather-hero-icon"><WeatherIcon code={weather?.weatherCode ?? 3} size={56} isNight={isNight} /></div>
      <div className="weather-hero-main">
        <div className="weather-temp">
          <strong>{weather ? `${weather.temperatureMax}°` : '--°'}</strong><span>／ {weather ? `${weather.temperatureMin}°` : '--°'}</span>
        </div>
        <p className="weather-narrative">{error ? <span className="weather-error">{error}</span> : narrative}</p>
        {weather?.isStale && <span className="weather-stale">上次更新資料</span>}
      </div>
      <div className="weather-hero-place">
        <strong className="weather-location-large">{location}</strong>
        <span className="weather-local-time">當地時間 {localTime}</span>
        <span className="weather-updated">{weather?.updatedAt ? `更新於 ${new Date(weather.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}` : '選擇地點後按更新'}</span>
      </div>
    </div>
    {advice && <div className={`weather-advice weather-advice--${theme}`}><span className="weather-advice-icon" aria-hidden="true">{advice.icon}</span><p>{advice.text}</p></div>}
    <div className="weather-location-disclosure">
      <button type="button" className="weather-location-toggle" onClick={() => setLocationPickerOpen((open) => !open)} aria-expanded={locationPickerOpen} aria-controls="weather-location-editor">
        <span>搜尋國家城市的天氣地點</span>
        {locationPickerOpen ? <ChevronUp aria-hidden="true" size={17} /> : <ChevronDown aria-hidden="true" size={17} />}
      </button>
      {locationPickerOpen && <form id="weather-location-editor" className="weather-location-editor" onSubmit={saveLocation}>
        <div className="weather-provider-toggle" role="group" aria-label="搜尋引擎">
          <button type="button" className={geocodingProvider === 'nominatim' ? 'provider-button is-active' : 'provider-button'} onClick={() => setGeocodingProvider('nominatim')} aria-pressed={geocodingProvider === 'nominatim'}>Nominatim</button>
          <button type="button" className={geocodingProvider === 'open-meteo' ? 'provider-button is-active' : 'provider-button'} onClick={() => setGeocodingProvider('open-meteo')} aria-pressed={geocodingProvider === 'open-meteo'}>Geocoding</button>
          <small>{geocodingProvider === 'nominatim' ? '中文更全（預設）' : '天氣專用'}</small>
        </div>
        <div className="weather-location-primary-search">
          <label htmlFor="weather-country-search"><Search aria-hidden="true" size={14} />搜尋國家或城市</label>
          <input id="weather-country-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="輸入國家或城市，例如：日本、台灣、台中、深圳" aria-label="搜尋國家或城市" />
        </div>
        {(onlineSearching || searchHits.length > 0) && <div className="weather-search-results" role="listbox" aria-label="搜尋結果">
          {onlineSearching && <small className="weather-search-hint">線上搜尋中…</small>}
          {!onlineSearching && searchHits.length === 0 && query.trim().length >= 2 && <small className="weather-search-hint">無匹配結果，嘗試其他關鍵字</small>}
          {searchHits.map((hit) => <button key={hit.key} type="button" className="weather-search-result" onClick={() => pickHit(hit)}>
            <Search aria-hidden="true" size={13} />
            <span>{hit.label}</span>
            <small aria-hidden="true">{hit.kind === 'country' ? '國家' : '城市'}</small>
          </button>)}
        </div>}
        <div className="weather-location-selects">
          <div className="weather-location-field">
            <label htmlFor="weather-country">國家／地區</label>
            <select id="weather-country" value={selectedCountryCode} onChange={(event) => changeCountry(event.target.value)} aria-label="選擇國家">
              <option value="">請選擇國家／地區</option>
              {filteredCountries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
          </div>
          <div className="weather-location-field">
            <label htmlFor="weather-city">城市</label>
            <select id="weather-city" value={selectedCityName} onChange={(event) => { setSelectedCityName(event.target.value); setSelectedCoords(null) }} aria-label="選擇城市" disabled={!selectedCountry}>
              <option value="">請選擇城市</option>
              {cityOptions.map((city) => <option key={`${city.query}:${city.name}`} value={city.name}>{city.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading || !selectedCountry || !selectedCityName}>更新天氣地點</button>
        <small>選擇國家與城市後按「更新天氣地點」才會重新抓取天氣</small>
      </form>}
    </div>
  </section>
}
