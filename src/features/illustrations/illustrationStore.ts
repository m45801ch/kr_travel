import { illustrationCatalog, type IllustrationCategory, type IllustrationOption } from '../../assets/illustrations'
import { db } from '../../data/db'

export type IllustrationOverride = {
  id: string
  label?: string
  category?: IllustrationCategory
}

export type CategoryConfig = {
  category: IllustrationCategory
  fontFamily?: string
  label?: string
}

export type IllustrationPreferences = {
  id: 'singleton'
  favoriteIds: string[]
  recentIds: string[]
}

export const ILLUSTRATION_PREFERENCES_ID = 'singleton' as const
export const MAX_RECENT_ILLUSTRATIONS = 12

const knownIllustrationIds = new Set(illustrationCatalog.map((item) => item.id))

export function isKnownIllustrationId(id: string): boolean {
  return knownIllustrationIds.has(id)
}

export function normalizeIllustrationIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []
  return Array.from(new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0 && isKnownIllustrationId(id))))
}

export function normalizeIllustrationPreferences(value: { favoriteIds?: unknown; recentIds?: unknown } | undefined): IllustrationPreferences {
  return {
    id: ILLUSTRATION_PREFERENCES_ID,
    favoriteIds: normalizeIllustrationIds(value?.favoriteIds),
    recentIds: normalizeIllustrationIds(value?.recentIds).slice(0, MAX_RECENT_ILLUSTRATIONS),
  }
}

export async function getIllustrationOverrides(): Promise<Record<string, IllustrationOverride>> {
  const all = await db.illustrationOverrides.toArray()
  return Object.fromEntries(all.map((o) => [o.id, o as IllustrationOverride]))
}

export async function getCategoryConfigs(): Promise<Record<string, CategoryConfig>> {
  const all = await db.categoryConfigs.toArray()
  return Object.fromEntries(all.map((c) => [c.category, c as CategoryConfig]))
}

export async function upsertIllustrationOverride(override: IllustrationOverride): Promise<void> {
  if (!isKnownIllustrationId(override.id)) return
  await db.illustrationOverrides.put(override)
}

export async function upsertCategoryConfig(config: CategoryConfig): Promise<void> {
  await db.categoryConfigs.put(config)
}

export async function deleteIllustrationOverride(id: string): Promise<void> {
  await db.illustrationOverrides.delete(id)
}

export function mergeCatalog(
  staticCatalog: IllustrationOption[],
  overrides: Record<string, IllustrationOverride>,
): IllustrationOption[] {
  return staticCatalog.map((item) => {
    const o = overrides[item.id]
    if (!o) return item
    return {
      ...item,
      label: o.label ?? item.label,
      category: (o.category as IllustrationCategory) ?? item.category,
    }
  })
}

export function getEffectiveCategories(catalog: IllustrationOption[]): IllustrationCategory[] {
  const cats = new Set<IllustrationCategory>(catalog.map((c) => c.category))
  return Array.from(cats) as IllustrationCategory[]
}

export function getCategoryFont(category: string, configs: Record<string, CategoryConfig>): string | undefined {
  return configs[category]?.fontFamily
}

export function getCategoryLabel(category: string, configs: Record<string, CategoryConfig>): string {
  return configs[category]?.label ?? category
}

export async function getIllustrationPreferences(): Promise<IllustrationPreferences> {
  const stored = await db.illustrationPreferences.get(ILLUSTRATION_PREFERENCES_ID)
  return normalizeIllustrationPreferences(stored)
}

async function saveIllustrationPreferences(preferences: Pick<IllustrationPreferences, 'favoriteIds' | 'recentIds'>): Promise<IllustrationPreferences> {
  const normalized = normalizeIllustrationPreferences(preferences)
  await db.illustrationPreferences.put(normalized)
  return normalized
}

export async function toggleIllustrationFavorite(id: string): Promise<IllustrationPreferences> {
  const current = await getIllustrationPreferences()
  if (!isKnownIllustrationId(id)) return current
  const favoriteIds = current.favoriteIds.includes(id)
    ? current.favoriteIds.filter((favoriteId) => favoriteId !== id)
    : [id, ...current.favoriteIds]
  return saveIllustrationPreferences({ ...current, favoriteIds })
}

export async function recordIllustrationUse(id: string): Promise<IllustrationPreferences> {
  const current = await getIllustrationPreferences()
  if (!isKnownIllustrationId(id)) return current
  const recentIds = [id, ...current.recentIds.filter((recentId) => recentId !== id)]
  return saveIllustrationPreferences({ ...current, recentIds })
}

export async function clearRecentIllustrations(): Promise<IllustrationPreferences> {
  const current = await getIllustrationPreferences()
  return saveIllustrationPreferences({ ...current, recentIds: [] })
}
