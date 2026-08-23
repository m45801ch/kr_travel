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
    for (let index = 0; index < MAX_RECENT_ILLUSTRATIONS + 1; index += 1) {
      await recordIllustrationUse(`landmark-${index}`)
    }

    const preferences = await getIllustrationPreferences()
    expect(preferences.recentIds).toHaveLength(MAX_RECENT_ILLUSTRATIONS)
    expect(preferences.recentIds[0]).toBe('landmark-12')
    expect(preferences.recentIds).not.toContain('landmark-0')

    await recordIllustrationUse('landmark-5')
    expect((await getIllustrationPreferences()).recentIds[0]).toBe('landmark-5')
  })

  it('清除最近使用時不會清掉最愛', async () => {
    await toggleIllustrationFavorite('taipei-101')
    await recordIllustrationUse('taipei-101')

    await clearRecentIllustrations()
    expect(await getIllustrationPreferences()).toMatchObject({ favoriteIds: ['taipei-101'], recentIds: [] })
  })
})
