import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { exportBackup, importBackup } from './backup'

afterEach(async () => { await Promise.all(db.tables.map((table) => table.clear())) })

describe('backup', () => {
  it('exports and imports versioned travel data', async () => {
    await db.trips.put({ id: 'trip-1', title: '首爾', destination: '首爾', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 1000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true })
    const blob = await exportBackup()
    await db.trips.clear()
    const report = await importBackup(new File([await blob.text()], 'backup.json', { type: 'application/json' }))
    expect(report.inserted).toBe(1)
    expect(await db.trips.get('trip-1')).toBeDefined()
  })

  it('rejects malformed backups', async () => {
    await expect(importBackup(new File(['{}'], 'bad.json'))).rejects.toThrow('備份檔格式不正確')
  })
})
