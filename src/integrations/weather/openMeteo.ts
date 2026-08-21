import type { WeatherSnapshot } from '../../domain/types'
import { KOREAN_PLACE_ALIASES } from './koreanPlaces'

interface GeocodingResult { latitude: number; longitude: number; name: string }

const descriptions: Record<number, string> = {
  0: '晴朗', 1: '大致晴朗', 2: '局部多雲', 3: '陰天', 45: '有霧', 48: '霧淞',
  51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨', 61: '小雨', 63: '中雨', 65: '大雨',
  71: '小雪', 73: '中雪', 75: '大雪', 80: '陣雨', 81: '陣雨', 82: '強陣雨', 95: '雷雨',
}

export function weatherDescription(code: number): string { return descriptions[code] ?? '天氣變化中' }

function toAliases(destination: string): string[] {
  const trimmed = destination.trim()
  const aliases = new Set<string>()
  const directAlias = KOREAN_PLACE_ALIASES[trimmed]
  if (directAlias) aliases.add(directAlias)
  // 原始輸入(可能已經是英文,如 Seoul)也可用來搜尋
  if (trimmed) aliases.add(trimmed)
  return Array.from(aliases)
}

export async function geocodeDestination(destination: string): Promise<GeocodingResult> {
  const candidates = toAliases(destination)
  const failures: string[] = []
  // 不限制國家，讓城市、景點與地區可以來自世界各地。
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
  throw new Error(`找不到目的地「${destination}」的位置(嘗試過:${failures.join('、') || '原始名稱與對照表名稱'})`)
}

export async function getForecast(latitude: number, longitude: number, date: string, locationName: string): Promise<WeatherSnapshot> {
  const requestedDate = new Date(`${date}T00:00:00`)
  const latestForecastDate = new Date()
  latestForecastDate.setHours(0, 0, 0, 0)
  latestForecastDate.setDate(latestForecastDate.getDate() + 16)
  if (requestedDate > latestForecastDate) throw new Error('此日期超出目前可預報範圍，請在接近出發日期後再更新。')

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&start_date=${date}&end_date=${date}`
  const response = await fetch(url)
  if (!response.ok) {
    let reason = ''
    try {
      const errorData = await response.json() as { reason?: string }
      reason = errorData.reason ?? ''
    } catch {
      // Ignore non-JSON error responses and use the generic message below.
    }
    if (/allowed range|start_date|end_date/i.test(reason)) throw new Error('此日期超出目前可預報範圍，請在接近出發日期後再更新。')
    throw new Error(reason ? `無法取得天氣資料：${reason}` : '無法取得天氣資料，請稍後再試。')
  }
  const data = await response.json() as { daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] } }
  const code = data.daily.weather_code[0] ?? 3
  return {
    date,
    temperatureMax: Math.round(data.daily.temperature_2m_max[0] ?? 0),
    temperatureMin: Math.round(data.daily.temperature_2m_min[0] ?? 0),
    weatherCode: code,
    description: weatherDescription(code),
    locationName,
  }
}
