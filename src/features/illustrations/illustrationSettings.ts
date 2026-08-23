import { db } from '../../data/db'
import { getIllustrationPreferences } from './illustrationStore'

export async function exportIllustrationSettings(): Promise<Blob> {
  const preferences = await getIllustrationPreferences()
  const payload = {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    categoryConfigs: await db.categoryConfigs.toArray(),
    illustrationOverrides: await db.illustrationOverrides.toArray(),
    favoriteIllustrationIds: preferences.favoriteIds,
    recentIllustrationIds: preferences.recentIds,
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}
