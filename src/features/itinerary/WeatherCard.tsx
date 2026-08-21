import { ChevronDown, ChevronUp, Cloud, CloudRain, RefreshCw, Search, Sun, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { WeatherSnapshot } from '../../domain/types'
import { WORLD_COUNTRIES } from './worldLocations'

function WeatherIcon({ code }: { code: number }) {
  if (code >= 51) return <CloudRain aria-hidden="true" size={34} />
  if (code === 0 || code === 1) return <Sun aria-hidden="true" size={34} />
  if (code === 45 || code === 48) return <Wind aria-hidden="true" size={34} />
  return <Cloud aria-hidden="true" size={34} />
}

type WeatherCardProps = {
  weather?: WeatherSnapshot & { isStale?: boolean; updatedAt?: string }
  error?: string
  loading: boolean
  location: string
  countryCode?: string
  cityQuery?: string
  onSaveLocation: (selection: { location: string; countryCode: string; cityQuery: string }) => void
  onRefresh: () => void
}

export function WeatherCard({ weather, error, loading, location, countryCode, cityQuery, onSaveLocation, onRefresh }: WeatherCardProps) {
  const currentCountry = useMemo(() => WORLD_COUNTRIES.find((country) => country.code === countryCode) ?? WORLD_COUNTRIES.find((country) => country.cities.some((city) => city.name === location)), [countryCode, location])
  const currentCity = useMemo(() => currentCountry?.cities.find((city) => city.query === cityQuery || city.name === location) ?? currentCountry?.cities[0], [cityQuery, currentCountry, location])
  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState(currentCountry?.code ?? '')
  const [selectedCityQuery, setSelectedCityQuery] = useState(currentCity?.query ?? '')

  const selectedCountry = WORLD_COUNTRIES.find((country) => country.code === selectedCountryCode) ?? currentCountry
  const filteredCountries = useMemo(() => {
    const keyword = countrySearch.trim().toLocaleLowerCase()
    if (!keyword) return WORLD_COUNTRIES
    return WORLD_COUNTRIES.filter((country) => country.name.toLocaleLowerCase().includes(keyword))
  }, [countrySearch])
  const filteredCities = useMemo(() => {
    const cities = selectedCountry?.cities ?? []
    const keyword = citySearch.trim().toLocaleLowerCase()
    if (!keyword) return cities
    return cities.filter((city) => city.name.toLocaleLowerCase().includes(keyword))
  }, [citySearch, selectedCountry])

  const changeCountry = (nextCountryCode: string) => {
    setSelectedCountryCode(nextCountryCode)
    const nextCountry = WORLD_COUNTRIES.find((country) => country.code === nextCountryCode)
    setSelectedCityQuery(nextCountry?.cities[0]?.query ?? '')
    setCitySearch('')
  }
  const saveLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextCountry = WORLD_COUNTRIES.find((country) => country.code === selectedCountryCode)
    const nextCity = nextCountry?.cities.find((city) => city.query === selectedCityQuery) ?? nextCountry?.cities[0]
    if (nextCountry && nextCity) {
      onSaveLocation({ location: nextCity.name, countryCode: nextCountry.code, cityQuery: nextCity.query })
      setLocationPickerOpen(false)
    }
  }

  return <section className="weather-card">
    <div className="weather-icon"><WeatherIcon code={weather?.weatherCode ?? 3} /></div>
    <div className="weather-reading">
      <strong>{weather ? `${weather.temperatureMax}°` : '--°'}</strong>
      <span>／ {weather ? `${weather.temperatureMin}°` : '--°'}</span>
      <small className={error ? 'weather-error' : undefined}>{error ?? (weather?.isStale ? '上次更新資料' : weather?.description ?? '等待天氣資料')}</small>
    </div>
    <div className="weather-place">
      <button type="button" onClick={onRefresh} aria-label="更新天氣"><RefreshCw className={loading ? 'spin' : ''} size={19} /></button>
      <strong>{location}</strong>
      <small>{weather?.updatedAt ? `更新於 ${new Date(weather.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}` : '選擇地點後按更新'}</small>
    </div>
    <div className="weather-location-disclosure">
      <button type="button" className="weather-location-toggle" onClick={() => setLocationPickerOpen((open) => !open)} aria-expanded={locationPickerOpen} aria-controls="weather-location-editor">
        <span>搜尋國家城市的天氣地點</span>
        {locationPickerOpen ? <ChevronUp aria-hidden="true" size={17} /> : <ChevronDown aria-hidden="true" size={17} />}
      </button>
      {locationPickerOpen && <form id="weather-location-editor" className="weather-location-editor" onSubmit={saveLocation}>
        <div className="weather-location-primary-search">
          <label htmlFor="weather-country-search"><Search aria-hidden="true" size={14} />搜尋國家城市的天氣地點</label>
          <input id="weather-country-search" value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} placeholder="輸入中文搜尋，例如：日本、美國、法國" aria-label="搜尋國家城市的天氣地點" />
        </div>
        <div className="weather-location-selects">
          <div className="weather-location-field">
            <label htmlFor="weather-country">國家／地區</label>
            <select id="weather-country" value={selectedCountryCode} onChange={(event) => changeCountry(event.target.value)} aria-label="選擇國家">
              <option value="">請選擇國家／地區</option>
              {filteredCountries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
          </div>
          <div className="weather-location-field">
            <label htmlFor="weather-city-search"><Search aria-hidden="true" size={14} />搜尋城市（中文）</label>
            <input id="weather-city-search" value={citySearch} onChange={(event) => setCitySearch(event.target.value)} placeholder="例如：東京、大阪" aria-label="搜尋城市（中文）" />
            <label htmlFor="weather-city">城市</label>
            <select id="weather-city" value={selectedCityQuery} onChange={(event) => setSelectedCityQuery(event.target.value)} aria-label="選擇城市" disabled={!selectedCountry}>
              <option value="">請選擇城市</option>
              {filteredCities.map((city) => <option key={city.query} value={city.query}>{city.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading || !selectedCountry || !selectedCityQuery}>更新天氣地點</button>
        <small>選擇國家與城市後按「更新天氣地點」才會重新抓取天氣</small>
      </form>}
    </div>
  </section>
}
