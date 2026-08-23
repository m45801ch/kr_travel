import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { db } from '../../data/db'
import { exportIllustrationSettings, importIllustrationSettings } from './illustrationSettings'

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

  it('匯入 v1 設定時，缺少最愛與最近使用欄位仍可成功', async () => {
    const payload = { schemaVersion: 1, categoryConfigs: [{ category: '景點', label: '舊景點' }], illustrationOverrides: [{ id: 'namsan-tower', label: '南山塔' }] }

    const report = await importIllustrationSettings(new File([JSON.stringify(payload)], 'v1.json', { type: 'application/json' }))

    expect(report.schemaVersion).toBe(1)
    expect(report.favoriteIllustrationIds).toBe(0)
    expect(report.recentIllustrationIds).toBe(0)
    expect(await db.categoryConfigs.get('景點')).toMatchObject({ label: '舊景點' })
    expect(await db.illustrationPreferences.get('singleton')).toMatchObject({ favoriteIds: [], recentIds: [] })
  })

  it('匯入時會清理重複、未知 ID 與非法覆寫項目', async () => {
    const payload = {
      schemaVersion: 2,
      categoryConfigs: [{ category: '景點', label: '景點' }, { category: '不存在' }],
      illustrationOverrides: [{ id: 'namsan-tower', label: '南山塔' }, { id: 'missing-icon', label: '壞圖示' }, { id: 'gyeongbokgung-palace' }],
      favoriteIllustrationIds: ['namsan-tower', 'namsan-tower', 'missing-icon'],
      recentIllustrationIds: ['gyeongbokgung-palace', 'missing-icon', 'gyeongbokgung-palace'],
    }

    const report = await importIllustrationSettings(new File([JSON.stringify(payload)], 'v2.json', { type: 'application/json' }))
    const preferences = await db.illustrationPreferences.get('singleton')

    expect(report.discarded).toBeGreaterThan(0)
    expect(await db.illustrationOverrides.toArray()).toEqual([{ id: 'namsan-tower', label: '南山塔' }])
    expect(preferences).toMatchObject({ favoriteIds: ['namsan-tower'], recentIds: ['gyeongbokgung-palace'] })
  })
})
