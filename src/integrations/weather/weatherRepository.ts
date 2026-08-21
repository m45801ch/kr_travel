import { db } from '../../data/db'
import type { WeatherCache, WeatherSnapshot } from '../../domain/types'
import { geocodeDestination, getForecast } from './openMeteo'

export async function getCachedOrFetchWeather(tripId: string, date: string, destination: string): Promise<WeatherSnapshot & { isStale?: boolean; updatedAt?: string }> {
  const locationKey = destination.trim().toLocaleLowerCase()
  const cacheId = `${tripId}:${date}:${locationKey}`
  const cached = await db.weatherCache.get(cacheId)
  try {
    const location = await geocodeDestination(destination)
    const snapshot = await getForecast(location.latitude, location.longitude, date, location.name)
    const record: WeatherCache = { id: cacheId, tripId, date, locationKey: `${location.latitude},${location.longitude}`, snapshot, updatedAt: new Date().toISOString() }
    await db.weatherCache.put(record)
    return snapshot
  } catch (error) {
    if (cached) return { ...cached.snapshot, isStale: true, updatedAt: cached.updatedAt }
    if (error instanceof Error) throw error
    throw new Error('目前沒有天氣資料，請連線後再試一次')
  }
}
