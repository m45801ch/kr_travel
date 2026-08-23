import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { db } from '../../data/db'
import { exportIllustrationSettings } from './illustrationSettings'

afterEach(async () => {
  await Promise.all([db.illustrationOverrides.clear(), db.categoryConfigs.clear(), db.illustrationPreferences.clear()])
})

describe('圖案設定匯出', () => {
  it('只匯出目前的圖案名稱、分類與分類設定', async () => {
    await db.categoryConfigs.put({ category: '景點', label: '景點標籤', fontFamily: 'sans-serif' })
    await db.illustrationOverrides.put({ id: 'namsan-tower', label: '南山塔', category: '景點' })
    await db.illustrationPreferences.put({ id: 'singleton', favoriteIds: ['namsan-tower'], recentIds: ['gyeongbokgung-palace'] })

    const payload = JSON.parse(await (await exportIllustrationSettings()).text())

    expect(payload.schemaVersion).toBe(2)
    expect(payload.categoryConfigs).toEqual([{ category: '景點', label: '景點標籤', fontFamily: 'sans-serif' }])
    expect(payload.illustrationOverrides).toEqual([{ id: 'namsan-tower', label: '南山塔', category: '景點' }])
    expect(payload.favoriteIllustrationIds).toEqual(['namsan-tower'])
    expect(payload.recentIllustrationIds).toEqual(['gyeongbokgung-palace'])
    expect(payload).not.toHaveProperty('trips')
    expect(payload).not.toHaveProperty('photos')
  })
})
