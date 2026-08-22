import { describe, expect, it } from 'vitest'
import { getForecast } from './openMeteo'

describe('getForecast', () => {
  it('explains when the requested date is beyond the forecast horizon', async () => {
    await expect(getForecast(37.5665, 126.978, '2099-01-25', '明洞')).rejects.toThrow('此日期超出目前可預報範圍')
  })
})
