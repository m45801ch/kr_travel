import { describe, expect, it } from 'vitest'
import { buildGoogleMapsSearchUrl } from './googleMapsUrl'

describe('Google Maps URL', () => {
  it('encodes a location query', () => {
    expect(buildGoogleMapsSearchUrl('景福宮 首爾')).toBe('https://www.google.com/maps/search/?api=1&query=%E6%99%AF%E7%A6%8F%E5%AE%AE%20%E9%A6%96%E7%88%BE')
  })
})
