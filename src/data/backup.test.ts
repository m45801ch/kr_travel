import 'fake-indexeddb/auto'
import { unzipSync, strFromU8 } from 'fflate'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { db } from './db'
import { exportBackup, exportEmergencyCsv, exportEmergencyHtml, exportEmergencyPackage, exportItinerarySnapshotHtml, importBackup } from './backup'

afterEach(async () => { vi.restoreAllMocks(); await Promise.all(db.tables.map((table) => table.clear())) })

describe('backup', () => {
  it('exports and imports versioned travel data', async () => {
    await db.trips.put({ id: 'trip-1', title: '首爾', destination: '首爾', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 1000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true })
    const blob = await exportBackup()
    await db.trips.clear()
    const report = await importBackup(new File([await blob.text()], 'backup.json', { type: 'application/json' }))
    expect(report.inserted).toBe(1)
    expect(await db.trips.get('trip-1')).toBeDefined()
    expect(await db.backupSnapshots.count()).toBe(1)
  })

  it('includes local photos in JSON backup and restores them on import', async () => {
    await db.trips.put({ id: 'trip-1', title: '照片旅程', destination: '東京', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 1000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true })
    const photo = { id: 'trip-photo', blob: new Blob(['photo-data'], { type: 'image/png' }) }
    await db.photos.put(photo)
    vi.spyOn(db.photos, 'toArray').mockResolvedValue([photo])

    const backup = await exportBackup()
    const content = await backup.text()
    expect(content).toContain('trip-photo')
    expect(content).toContain('data:image/png;base64,')

    vi.restoreAllMocks()
    await Promise.all(db.tables.map((table) => table.clear()))
    const photoPut = vi.spyOn(db.photos, 'put')
    await importBackup(new File([content], 'backup.json', { type: 'application/json' }))
    const restored = photoPut.mock.calls.find(([value]) => value.id === 'trip-photo')?.[0]
    expect(restored).toBeDefined()
    expect(restored?.blob.type).toBe('image/png')
    expect(restored?.blob.size).toBe(10)
  })

  it('exports one ZIP emergency package containing readable and restorable files', async () => {
    await db.trips.put({ id: 'trip-1', title: 'ZIP 旅程', destination: '巴黎', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'EUR', budgetMinor: 1000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true })
    const packageBlob = await exportEmergencyPackage()
    expect(packageBlob.type).toBe('application/zip')
    expect(packageBlob.size).toBeGreaterThan(100)
    const files = unzipSync(new Uint8Array(await packageBlob.arrayBuffer()))
    expect(Object.keys(files)).toEqual(expect.arrayContaining(['travel-emergency.html', 'travel-emergency.csv', 'travel-backup.json', 'README.txt']))
    expect(strFromU8(files['travel-emergency.html'])).toContain('ZIP 旅程')
  })

  it('rejects malformed backups', async () => {
    await expect(importBackup(new File(['{}'], 'bad.json'))).rejects.toThrow('備份檔格式不正確')
  })

  it('exports a readable offline HTML file with travel data and embedded photos', async () => {
    await db.trips.put({ id: 'trip-1', title: '東京小旅行', destination: '東京', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 1000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true })
    await db.days.put({ id: 'day-1', tripId: 'trip-1', date: '2026-08-25', city: '東京', title: 'Day 1 抵達', summary: '抵達東京', accommodation: '', illustrationId: 'hanbok-woman', photoId: 'day-photo' })
    await db.activities.put({ id: 'activity-1', tripId: 'trip-1', dayId: 'day-1', date: '2026-08-25', time: '10:00', type: 'spot', title: '淺草寺', locationName: '淺草', address: '', googleMapsUrl: '', notes: '避開人潮', order: 0, illustrationId: 'namsan-tower' })
    await db.members.put({ id: 'member-1', tripId: 'trip-1', name: '小美', color: '#ef8490', illustrationId: 'companion-girl', notes: '', lineAddUrl: 'https://line.me/R/ti/p/example', photoId: 'member-photo', lineQrPhotoId: 'qr-photo' })
    await db.listItems.put({ id: 'list-1', tripId: 'trip-1', type: 'shopping', name: '伴手禮', category: '購物', note: '抹茶', priority: 'normal', location: '東京車站', illustrationId: 'shopping-bag', completed: false, order: 0 })
    await db.expenses.put({ id: 'expense-1', tripId: 'trip-1', date: '2026-08-25', amountMinor: 1200, currency: 'JPY', exchangeRateToBase: 0.22, baseAmountMinor: 264, conversionCurrency: 'TWD', conversionRate: 0.22, convertedAmountMinor: 264, category: '美食', payerId: 'member-1', paymentMethod: 'credit-card', splitMode: 'equal', notes: '拉麵' })
    const photos = [
      { id: 'day-photo', blob: new Blob(['day'], { type: 'image/png' }) },
      { id: 'member-photo', blob: new Blob(['member'], { type: 'image/jpeg' }) },
      { id: 'qr-photo', blob: new Blob(['qr'], { type: 'image/png' }) },
    ]
    vi.spyOn(db.photos, 'toArray').mockResolvedValue(photos)

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(new Blob(['illustration'], { type: 'image/webp' }), { status: 200 }))
    const html = await exportEmergencyHtml()
    const content = await html.text()
    expect(content).toContain('東京小旅行')
    expect(content).toContain('淺草寺')
    expect(content).toContain('伴手禮')
    expect(content).toContain('小美')
    expect(content).toContain('拉麵')
    expect(content).toContain('data:image/png;base64,')
    expect(content).toContain('data:image/jpeg;base64,')
    expect(content).toMatch(/class="embedded-illustration" src="data:/)

    const countsBefore = await Promise.all(db.tables.map((table) => table.count()))
    const snapshot = await exportItinerarySnapshotHtml()
    const snapshotContent = await snapshot.text()
    const countsAfter = await Promise.all(db.tables.map((table) => table.count()))
    expect(snapshot.type).toBe('text/html;charset=utf-8')
    expect(snapshotContent).toContain('<title>東京小旅行｜行程快照</title>')
    expect(snapshotContent).toContain('文件類型：行程快照')
    expect(snapshotContent).toContain('2026-08-25')
    expect(snapshotContent).toContain('10:00')
    expect(snapshotContent).toContain('淺草')
    expect(snapshotContent).toContain('避開人潮')
    expect(snapshotContent).toMatch(/class="embedded-illustration" src="data:[^"]+;base64,/)
    expect(countsAfter).toEqual(countsBefore)
  })

  it('exports CSV with escaped commas, quotes, and line breaks', async () => {
    await db.trips.put({ id: 'trip-1', title: '東京,小旅行', destination: '東京', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 1000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true })
    await db.listItems.put({ id: 'list-1', tripId: 'trip-1', type: 'prep', name: '護照', category: '證件', note: '放在「隨身包」\n出發前確認', priority: 'important', location: '', illustrationId: 'airport-travel', completed: false, order: 0 })

    const csv = await (await exportEmergencyCsv()).text()
    expect(csv).toContain('東京,小旅行')
    expect(csv).toContain('"東京,小旅行"')
    expect(csv).toContain('"放在「隨身包」\n出發前確認"')
  })
})
