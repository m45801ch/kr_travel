import { db } from '../../data/db'

export async function exportIllustrationSettings(): Promise<Blob> {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    categoryConfigs: await db.categoryConfigs.toArray(),
    illustrationOverrides: await db.illustrationOverrides.toArray(),
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}
