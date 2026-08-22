import type { MapProvider } from '../../domain/types'
import { buildGoogleMapsSearchUrl } from './googleMapsUrl'

export function buildNaverMapsSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query.trim())}`
}

export function buildAppleMapsSearchUrl(query: string): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(query.trim())}`
}

export function buildMapSearchUrl(query: string, provider: MapProvider = 'google'): string {
  if (provider === 'naver') return buildNaverMapsSearchUrl(query)
  if (provider === 'apple') return buildAppleMapsSearchUrl(query)
  return buildGoogleMapsSearchUrl(query)
}
