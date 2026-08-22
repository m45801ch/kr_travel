import type { WeatherSnapshot } from '../../domain/types'
import { KOREAN_PLACE_ALIASES } from './koreanPlaces'
import { WORLD_COUNTRIES } from '../../features/itinerary/worldLocations'

interface GeocodingResult { latitude: number; longitude: number; name: string }

const descriptions: Record<number, string> = {
  0: '晴朗', 1: '大致晴朗', 2: '局部多雲', 3: '陰天', 45: '有霧', 48: '霧淞',
  51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨', 61: '小雨', 63: '中雨', 65: '大雨',
  71: '小雪', 73: '中雪', 75: '大雪', 80: '陣雨', 81: '陣雨', 82: '強陣雨', 95: '雷雨',
}

export function weatherDescription(code: number): string { return descriptions[code] ?? '天氣變化中' }

function wttrCodeToOpenMeteo(code: number): number {
  if (code === 113) return 0
  if (code === 116) return 1
  if (code === 119) return 2
  if (code === 122) return 3
  if (code === 143 || code === 248 || code === 260) return 45
  if ([176, 179, 182, 185, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 320, 323, 326, 353, 356, 359, 362].includes(code)) return 61
  if ([200, 386, 389, 392, 395].includes(code)) return 95
  if ([227, 230, 329, 332, 335, 338, 368, 371].includes(code)) return 71
  return 3
}

function sevenTimerWeatherToCode(weather: string): number {
  const w = weather.toLowerCase()
  if (w.includes('clear')) return 0
  if (w.includes('pcloudy')) return 1
  if (w.includes('mcloudy')) return 2
  if (w === 'cloudy' || w === 'humid') return 3
  if (w.includes('lightrain') || w.includes('oshower') || w.includes('ishower')) return 61
  if (w === 'rain') return 63
  if (w.includes('snow') || w.includes('lightsnow')) return 71
  if (w.includes('rainsnow')) return 67
  if (w.includes('tstorm')) return 95
  return 3
}

function metNoSymbolToCode(symbol: string): number {
  const s = symbol.toLowerCase().replace(/_(day|night|evening)$/, '')
  if (s.includes('clearsky')) return 0
  if (s.includes('fair')) return 1
  if (s.includes('partlycloudy')) return 2
  if (s.includes('cloudy')) return 3
  if (s.includes('fog')) return 45
  if (s.includes('lightrain') || s.includes('lightrainshowers')) return 61
  if (s.includes('rainshowers') || s.includes('rain')) return 63
  if (s.includes('sleet') || s.includes('lightsleet')) return 67
  if (s.includes('snow') || s.includes('lightsnow')) return 71
  if (s.includes('thunder')) return 95
  return 3
}

async function fetchForecastFallback(latitude: number, longitude: number, date: string, locationName: string): Promise<WeatherSnapshot | null> {
  try {
    const wttrRes = await fetch(`https://wttr.in/${latitude},${longitude}?format=j1`)
    if (wttrRes.ok) {
      const wttrData = (await wttrRes.json()) as { weather?: Array<{ date: string; maxtempC: string; mintempC: string; hourly: Array<{ weatherCode: string }> }> }
      const day = wttrData.weather?.find((item) => item.date === date)
      if (day) {
        const code = Number.parseInt(day.hourly?.[4]?.weatherCode ?? day.hourly?.[0]?.weatherCode ?? '113', 10)
        const mapped = wttrCodeToOpenMeteo(code)
        return { date, temperatureMax: Math.round(Number.parseFloat(day.maxtempC)), temperatureMin: Math.round(Number.parseFloat(day.mintempC)), weatherCode: mapped, description: weatherDescription(mapped), locationName }
      }
    }
  } catch {}
  try {
    const url = `https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civillight&output=json`
    const res = await fetch(url)
    if (res.ok) {
      const data = (await res.json()) as { dataseries?: Array<{ date: number; weather: string; temp2m: { max: number; min: number } }> }
      const target = Number.parseInt(date.replace(/-/g, ''), 10)
      const entry = data.dataseries?.find((item) => item.date === target)
      if (entry) {
        const mapped = sevenTimerWeatherToCode(entry.weather)
        return { date, temperatureMax: Math.round(entry.temp2m.max), temperatureMin: Math.round(entry.temp2m.min), weatherCode: mapped, description: weatherDescription(mapped), locationName }
      }
    }
  } catch {}
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } as HeadersInit })
    if (res.ok) {
      const data: any = await res.json()
      const series: any[] = data.properties?.timeseries ?? []
      const dayEntries = series.filter((item) => item.time.startsWith(date))
      if (dayEntries.length > 0) {
        const temps = dayEntries.map((item) => item.data.instant.details.air_temperature).filter((v) => typeof v === 'number')
        const max = temps.length ? Math.max(...temps) : 0
        const min = temps.length ? Math.min(...temps) : 0
        const symbol = dayEntries.find((item) => item.data.next_6_hours?.summary.symbol_code)?.data.next_6_hours?.summary.symbol_code ?? dayEntries.find((item) => item.data.next_1_hours?.summary.symbol_code)?.data.next_1_hours?.summary.symbol_code ?? 'cloudy'
        const mapped = metNoSymbolToCode(symbol)
        return { date, temperatureMax: Math.round(max), temperatureMin: Math.round(min), weatherCode: mapped, description: weatherDescription(mapped), locationName }
      }
    }
  } catch {}
  return null
}

function toAliases(destination: string): string[] {
  const trimmed = destination.trim()
  const aliases = new Set<string>()
  const directAlias = KOREAN_PLACE_ALIASES[trimmed]
  if (directAlias) aliases.add(directAlias)
  const withoutShi = trimmed.replace(/市$/, '')
  const norm = (s: string) => s.replace(/臺/g, '台').toLocaleLowerCase()
  const normalizedTrimmed = norm(trimmed)
  const normalizedWithoutShi = withoutShi ? norm(withoutShi) : ''
  for (const country of WORLD_COUNTRIES) {
    for (const city of country.cities) {
      if (norm(city.name) === normalizedTrimmed || (withoutShi && norm(city.name) === normalizedWithoutShi)) aliases.add(city.query)
    }
  }
  if (trimmed) aliases.add(trimmed)
  if (withoutShi && withoutShi !== trimmed) aliases.add(withoutShi)
  return Array.from(aliases)
}

export async function geocodeDestination(destination: string): Promise<GeocodingResult> {
  const candidates = toAliases(destination)
  const failures: string[] = []
  for (const candidate of candidates) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=1&country_code=KR&format=json`
      const response = await fetch(url)
      if (!response.ok) { failures.push(`${candidate}(${candidate === destination ? 'original' : 'alias'}) HTTP ${response.status}`); continue }
      const data = await response.json() as { results?: GeocodingResult[] }
      const result = data.results?.[0]
      if (result) return result
    } catch {
      failures.push(`${candidate}(network)`)
    }
  }
  for (const candidate of candidates) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=1&format=json`
      const response = await fetch(url)
      if (!response.ok) continue
      const data = await response.json() as { results?: GeocodingResult[] }
      const result = data.results?.[0]
      if (result) return result
    } catch {
      failures.push(`${candidate}(network)`)
    }
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination.trim())}&format=json&addressdetails=1&accept-language=zh&limit=1`
    const response = await fetch(url, { headers: { 'Accept-Language': 'zh-TW,zh;q=0.9' } as HeadersInit })
    if (response.ok) {
      const data = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>
      const first = data[0]
      if (first) return { latitude: Number.parseFloat(first.lat), longitude: Number.parseFloat(first.lon), name: first.display_name.split(',')[0].trim() || destination.trim() }
    }
  } catch {
    failures.push(`${destination.trim()}(nominatim)`)
  }
  throw new Error(`找不到目的地「${destination}」的位置(嘗試過:${failures.join('、') || '原始名稱與對照表名稱'})`)
}

export async function getForecast(latitude: number, longitude: number, date: string, locationName: string): Promise<WeatherSnapshot> {
  const requestedDate = new Date(`${date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysAhead = Math.floor((requestedDate.getTime() - today.getTime()) / 86_400_000)
  if (!Number.isFinite(requestedDate.getTime()) || daysAhead > 16) throw new Error('此日期超出目前可預報範圍，請在接近出發日期後再更新。')

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&start_date=${date}&end_date=${date}`
  let response: Response | null = null
  let reason = ''
  try {
    response = await fetch(url)
    if (!response.ok) {
      try {
        const errorData = (await response.json()) as { reason?: string }
        reason = errorData.reason ?? ''
      } catch {}
      if (/allowed range|start_date|end_date/i.test(reason)) throw new Error('此日期超出目前可預報範圍，請在接近出發日期後再更新。')
      throw new Error(reason ? `無法取得天氣資料：${reason}` : `HTTP ${response.status}`)
    }
  } catch (error) {
    if (error instanceof Error && /超出目前可預報範圍/.test(error.message)) throw error
    const fallback = await fetchForecastFallback(latitude, longitude, date, locationName)
    if (fallback) return fallback
    throw error instanceof Error ? error : new Error('無法取得天氣資料，請稍後再試。')
  }
  try {
    const data = (await response!.json()) as { timezone?: string; daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] } }
    const code = data.daily.weather_code[0] ?? 3
    return {
      date,
      temperatureMax: Math.round(data.daily.temperature_2m_max[0] ?? 0),
      temperatureMin: Math.round(data.daily.temperature_2m_min[0] ?? 0),
      weatherCode: code,
      description: weatherDescription(code),
      locationName,
      timezone: data.timezone,
    }
  } catch {
    const fallback = await fetchForecastFallback(latitude, longitude, date, locationName)
    if (fallback) return fallback
    throw new Error('無法取得天氣資料，請稍後再試。')
  }
}
