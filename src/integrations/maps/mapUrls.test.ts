import { describe, expect, it } from 'vitest'
import { buildAppleMapsSearchUrl, buildMapSearchUrl } from './mapUrls'

describe('map search URLs', () => {
  it('builds an Apple Maps search URL', () => {
    expect(buildAppleMapsSearchUrl('景福宮 首爾')).toBe('https://maps.apple.com/?q=%E6%99%AF%E7%A6%8F%E5%AE%AE%20%E9%A6%96%E7%88%BE')
  })

  it('selects Apple Maps through the provider-aware builder', () => {
    expect(buildMapSearchUrl('N Seoul Tower', 'apple')).toBe('https://maps.apple.com/?q=N%20Seoul%20Tower')
  })
})
