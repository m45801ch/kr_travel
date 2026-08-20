import type { WeatherSnapshot } from '../../domain/types'

interface GeocodingResult { latitude: number; longitude: number; name: string }

const descriptions: Record<number, string> = {
  0: '晴朗', 1: '大致晴朗', 2: '局部多雲', 3: '陰天', 45: '有霧', 48: '霧淞',
  51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨', 61: '小雨', 63: '中雨', 65: '大雨',
  71: '小雪', 73: '中雪', 75: '大雪', 80: '陣雨', 81: '陣雨', 82: '強陣雨', 95: '雷雨',
}

export function weatherDescription(code: number): string { return descriptions[code] ?? '天氣變化中' }

export async function geocodeDestination(destination: string): Promise<GeocodingResult> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=zh&format=json`
  const response = await fetch(url)
  if (!response.ok) throw new Error('無法取得目的地位置')
  const data = await response.json() as { results?: GeocodingResult[] }
  const result = data.results?.[0]
  if (!result) throw new Error('找不到目的地')
  return result
}

export async function getForecast(latitude: number, longitude: number, date: string, locationName: string): Promise<WeatherSnapshot> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&start_date=${date}&end_date=${date}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('無法取得天氣資料')
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
