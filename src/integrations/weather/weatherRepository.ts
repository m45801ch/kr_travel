import { db } from '../../data/db'
import type { WeatherCache, WeatherSnapshot } from '../../domain/types'
import { geocodeDestination, getForecast } from './openMeteo'

export async function getCachedOrFetchWeather(tripId: string, date: string, destination: string, coords?: { latitude: number; longitude: number }): Promise<WeatherSnapshot & { isStale?: boolean; updatedAt?: string }> {
  const locationKey = coords ? `${coords.latitude},${coords.longitude}` : destination.trim().toLocaleLowerCase()
  const cacheId = `${tripId}:${date}:${locationKey}`
  const cached = await db.weatherCache.get(cacheId)
  try {
    let latitude: number
    let longitude: number
    let locationName: string
    if (coords) {
      latitude = coords.latitude
      longitude = coords.longitude
      locationName = destination
    } else {
      const location = await geocodeDestination(destination)
      latitude = location.latitude
      longitude = location.longitude
      locationName = location.name
    }
    const snapshot = await getForecast(latitude, longitude, date, locationName)
    const record: WeatherCache = { id: cacheId, tripId, date, locationKey: `${latitude},${longitude}`, snapshot, updatedAt: new Date().toISOString() }
    await db.weatherCache.put(record)
    return snapshot
  } catch (error) {
    if (cached) return { ...cached.snapshot, isStale: true, updatedAt: cached.updatedAt }
    if (error instanceof Error) throw error
    throw new Error('目前沒有天氣資料，請連線後再試一次')
  }
}
