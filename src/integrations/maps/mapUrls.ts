import type { MapProvider } from '../../domain/types'
import { buildGoogleMapsSearchUrl } from './googleMapsUrl'

export function buildNaverMapsSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query.trim())}`
}

export function buildMapSearchUrl(query: string, provider: MapProvider = 'google'): string {
  return provider === 'naver' ? buildNaverMapsSearchUrl(query) : buildGoogleMapsSearchUrl(query)
}
