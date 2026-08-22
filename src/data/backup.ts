import { db } from './db'
import type { Activity, Expense, ExpenseSplit, ListItem, Member, Settings, Trip, TripDay, WeatherCache } from '../domain/types'

interface BackupData { trips: Trip[]; days: TripDay[]; activities: Activity[]; members: Member[]; expenses: Expense[]; expenseSplits: ExpenseSplit[]; listItems: ListItem[]; weatherCache: WeatherCache[]; settings: Settings[] }
interface BackupPayload { schemaVersion: 1; exportedAt: string; data: BackupData }
export interface BackupReport { inserted: number; skippedPhotos: boolean }

async function readData(): Promise<BackupData> {
  return { trips: await db.trips.toArray(), days: await db.days.toArray(), activities: await db.activities.toArray(), members: await db.members.toArray(), expenses: await db.expenses.toArray(), expenseSplits: await db.expenseSplits.toArray(), listItems: await db.listItems.toArray(), weatherCache: await db.weatherCache.toArray(), settings: await db.settings.toArray() }
}

export async function exportBackup(): Promise<Blob> {
  const payload: BackupPayload = { schemaVersion: 1, exportedAt: new Date().toISOString(), data: await readData() }
  return new Blob([JSON.stringify(payload)], { type: 'application/json' })
}

function isValidPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<BackupPayload>
  if (payload.schemaVersion !== 1 || !payload.data) return false
  return ['trips', 'days', 'activities', 'members', 'expenses', 'expenseSplits', 'listItems', 'weatherCache', 'settings'].every((key) => Array.isArray((payload.data as unknown as Record<string, unknown>)[key]))
}

export async function importBackup(file: File): Promise<BackupReport> {
  const payload: unknown = JSON.parse(await file.text())
  if (!isValidPayload(payload)) throw new Error('備份檔格式不正確或版本不支援')
  const { data } = payload
  await db.transaction('rw', db.tables, async () => {
    await db.trips.bulkPut(data.trips); await db.days.bulkPut(data.days); await db.activities.bulkPut(data.activities); await db.members.bulkPut(data.members); await db.expenses.bulkPut(data.expenses); await db.expenseSplits.bulkPut(data.expenseSplits); await db.listItems.bulkPut(data.listItems); await db.weatherCache.bulkPut(data.weatherCache); await db.settings.bulkPut(data.settings)
  })
  return { inserted: Object.values(data).reduce((sum, records) => sum + records.length, 0), skippedPhotos: true }
}
