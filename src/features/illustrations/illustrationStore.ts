import { db } from '../../data/db'
import { illustrationCatalog as staticCatalog, type IllustrationCategory, type IllustrationOption } from '../../assets/illustrations'

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

export async function getIllustrationOverrides(): Promise<Record<string, IllustrationOverride>> {
  const all = await db.illustrationOverrides.toArray()
  return Object.fromEntries(all.map((o) => [o.id, o as IllustrationOverride]))
}

export async function getCategoryConfigs(): Promise<Record<string, CategoryConfig>> {
  const all = await db.categoryConfigs.toArray()
  return Object.fromEntries(all.map((c) => [c.category, c as CategoryConfig]))
}

export async function upsertIllustrationOverride(override: IllustrationOverride): Promise<void> {
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
