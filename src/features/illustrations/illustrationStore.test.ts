import { afterEach, describe, expect, it } from 'vitest'
import { db } from '../../data/db'
import { clearRecentIllustrations, getIllustrationPreferences, MAX_RECENT_ILLUSTRATIONS, recordIllustrationUse, toggleIllustrationFavorite } from './illustrationStore'

afterEach(async () => {
  await db.illustrationPreferences.clear()
})

describe('圖案使用偏好', () => {
  it('可以切換最愛，並保留最愛資料到 IndexedDB', async () => {
    await toggleIllustrationFavorite('namsan-tower')

    expect(await getIllustrationPreferences()).toMatchObject({ favoriteIds: ['namsan-tower'], recentIds: [] })

    await toggleIllustrationFavorite('namsan-tower')
    expect(await getIllustrationPreferences()).toMatchObject({ favoriteIds: [], recentIds: [] })
  })

  it('會將最近使用項目去重並限制在 12 筆', async () => {
    const ids = [
      'service-01-airport-terminal', 'service-02-airport-shuttle', 'service-03-ktx-train', 'service-04-subway-exit',
      'service-05-bus-stop', 'service-06-taxi', 'service-07-convenience-store', 'service-08-tourist-information',
      'service-09-ticket-counter', 'service-10-luggage-storage', 'service-11-wifi-hotspot', 'service-12-sim-esim', 'landmark-11-taipei-101',
    ]
    for (const id of ids) await recordIllustrationUse(id)

    const preferences = await getIllustrationPreferences()
    expect(preferences.recentIds).toHaveLength(MAX_RECENT_ILLUSTRATIONS)
    expect(preferences.recentIds[0]).toBe('landmark-11-taipei-101')
    expect(preferences.recentIds).not.toContain('service-01-airport-terminal')

    await recordIllustrationUse('service-05-bus-stop')
    expect((await getIllustrationPreferences()).recentIds[0]).toBe('service-05-bus-stop')
  })

  it('清除最近使用時不會清掉最愛', async () => {
    await toggleIllustrationFavorite('landmark-11-taipei-101')
    await recordIllustrationUse('landmark-11-taipei-101')

    await clearRecentIllustrations()
    expect(await getIllustrationPreferences()).toMatchObject({ favoriteIds: ['landmark-11-taipei-101'], recentIds: [] })
  })

  it('會清理不存在的 ID，且資料庫重開後仍保留有效偏好', async () => {
    await db.illustrationPreferences.put({ id: 'singleton', favoriteIds: ['namsan-tower', 'missing-icon', 'namsan-tower'], recentIds: ['service-01-airport-terminal', 'missing-icon'] })

    expect(await getIllustrationPreferences()).toMatchObject({ favoriteIds: ['namsan-tower'], recentIds: ['service-01-airport-terminal'] })

    db.close()
    await db.open()
    expect(await getIllustrationPreferences()).toMatchObject({ favoriteIds: ['namsan-tower'], recentIds: ['service-01-airport-terminal'] })
  })
})
