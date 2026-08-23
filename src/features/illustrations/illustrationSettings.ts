import { illustrationCategories, type IllustrationCategory } from '../../assets/illustrations'
import { db } from '../../data/db'
import { getIllustrationPreferences, isKnownIllustrationId, normalizeIllustrationPreferences, normalizeIllustrationIds, type CategoryConfig, type IllustrationOverride } from './illustrationStore'

export interface IllustrationSettingsPayload {
  schemaVersion?: number
  exportedAt?: string
  categoryConfigs?: unknown
  illustrationOverrides?: unknown
  favoriteIllustrationIds?: unknown
  recentIllustrationIds?: unknown
}

export interface IllustrationSettingsImportReport {
  schemaVersion: number
  categoryConfigs: number
  illustrationOverrides: number
  favoriteIllustrationIds: number
  recentIllustrationIds: number
  discarded: number
}

const validCategories = new Set<string>(illustrationCategories)

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeCategoryConfigs(value: unknown): { values: CategoryConfig[]; discarded: number } {
  if (!Array.isArray(value)) return { values: [], discarded: 0 }
  const values: CategoryConfig[] = []
  let discarded = 0
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.category !== 'string' || !validCategories.has(entry.category)) {
      discarded += 1
      continue
    }
    values.push({
      category: entry.category as IllustrationCategory,
      label: typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : undefined,
      fontFamily: typeof entry.fontFamily === 'string' && entry.fontFamily.trim() ? entry.fontFamily.trim() : undefined,
    })
  }
  return { values, discarded }
}

function normalizeOverrides(value: unknown): { values: IllustrationOverride[]; discarded: number } {
  if (!Array.isArray(value)) return { values: [], discarded: 0 }
  const values: IllustrationOverride[] = []
  let discarded = 0
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !isKnownIllustrationId(entry.id)) {
      discarded += 1
      continue
    }
    const category = typeof entry.category === 'string' && validCategories.has(entry.category) ? entry.category as IllustrationCategory : undefined
    const label = typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : undefined
    if (!category && !label) {
      discarded += 1
      continue
    }
    values.push({ id: entry.id, label, category })
  }
  return { values, discarded }
}

export async function importIllustrationSettings(file: File): Promise<IllustrationSettingsImportReport> {
  const parsed: unknown = JSON.parse(await file.text())
  if (!isRecord(parsed)) throw new Error('圖案設定格式不正確')
  const payload = parsed as IllustrationSettingsPayload
  const schemaVersion = payload.schemaVersion === 1 || payload.schemaVersion === 2 ? payload.schemaVersion : undefined
  if (!schemaVersion) throw new Error('圖案設定版本不支援')

  const categoryConfigs = normalizeCategoryConfigs(payload.categoryConfigs)
  const illustrationOverrides = normalizeOverrides(payload.illustrationOverrides)
  const currentPreferences = normalizeIllustrationPreferences({
    favoriteIds: payload.favoriteIllustrationIds,
    recentIds: payload.recentIllustrationIds,
  })
  const rawFavoriteIds = Array.isArray(payload.favoriteIllustrationIds) ? payload.favoriteIllustrationIds.length : 0
  const rawRecentIds = Array.isArray(payload.recentIllustrationIds) ? payload.recentIllustrationIds.length : 0
  const discarded = categoryConfigs.discarded + illustrationOverrides.discarded
    + Math.max(0, rawFavoriteIds - currentPreferences.favoriteIds.length)
    + Math.max(0, rawRecentIds - currentPreferences.recentIds.length)

  await db.transaction('rw', db.categoryConfigs, db.illustrationOverrides, db.illustrationPreferences, async () => {
    await db.categoryConfigs.clear()
    await db.illustrationOverrides.clear()
    await db.categoryConfigs.bulkPut(categoryConfigs.values)
    await db.illustrationOverrides.bulkPut(illustrationOverrides.values)
    await db.illustrationPreferences.put({ id: 'singleton', favoriteIds: currentPreferences.favoriteIds, recentIds: currentPreferences.recentIds })
  })

  return {
    schemaVersion,
    categoryConfigs: categoryConfigs.values.length,
    illustrationOverrides: illustrationOverrides.values.length,
    favoriteIllustrationIds: currentPreferences.favoriteIds.length,
    recentIllustrationIds: currentPreferences.recentIds.length,
    discarded,
  }
}

export function cleanIllustrationIds(ids: unknown): string[] {
  return normalizeIllustrationIds(ids)
}
