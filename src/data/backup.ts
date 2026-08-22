import { db } from './db'
import type { Activity, Expense, ExpenseSplit, ListItem, Member, Settings, Trip, TripDay, WeatherCache } from '../domain/types'
import { fromMinorUnits } from '../domain/money'
import { strToU8, zipSync } from 'fflate'

interface BackupData { trips: Trip[]; days: TripDay[]; activities: Activity[]; members: Member[]; expenses: Expense[]; expenseSplits: ExpenseSplit[]; listItems: ListItem[]; weatherCache: WeatherCache[]; settings: Settings[] }
interface BackupPhoto { id: string; dataUrl: string }
interface BackupPayload { schemaVersion: 1 | 2; exportedAt: string; data: BackupData; photos?: BackupPhoto[] }
export interface BackupReport { inserted: number; skippedPhotos: boolean }
export interface BackupSnapshot { id: string; createdAt: string; blob: Blob }

async function readData(): Promise<BackupData> {
  return { trips: await db.trips.toArray(), days: await db.days.toArray(), activities: await db.activities.toArray(), members: await db.members.toArray(), expenses: await db.expenses.toArray(), expenseSplits: await db.expenseSplits.toArray(), listItems: await db.listItems.toArray(), weatherCache: await db.weatherCache.toArray(), settings: await db.settings.toArray() }
}

export async function exportBackup(): Promise<Blob> {
  const photoUrls = await readPhotoDataUrls()
  const payload: BackupPayload = { schemaVersion: 2, exportedAt: new Date().toISOString(), data: await readData(), photos: Array.from(photoUrls, ([id, dataUrl]) => ({ id, dataUrl })) }
  return new Blob([JSON.stringify(payload)], { type: 'application/json' })
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function csvCell(value: unknown): string {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(',')
}

function paymentMethodLabel(value?: string): string {
  const labels: Record<string, string> = { cash: '現金', 'credit-card': '信用卡', 'debit-card': '簽帳金融卡', 'google-pay': 'Google Pay', 'apple-pay': 'Apple Pay', 'samsung-pay': 'Samsung Pay', 'line-pay': 'LINE Pay', 'bank-transfer': '銀行轉帳', 'transit-card': '交通卡', 'qr-pay': 'QR Code 支付', other: '其他' }
  return value ? labels[value] ?? value : ''
}

function formatExpense(expense: Expense): string {
  return `${fromMinorUnits(expense.amountMinor, expense.currency)} ${expense.currency}`
}

async function formatPhotoDataUrl(blob: Blob): Promise<string> {
  if (typeof blob.arrayBuffer !== 'function') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.onerror = () => reject(reader.error ?? new Error('照片讀取失敗'))
      reader.readAsDataURL(blob)
    })
  }
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`
}

async function readPhotoDataUrls(): Promise<Map<string, string>> {
  const photos = await db.photos.toArray()
  const entries = await Promise.all(photos.map(async (photo) => [photo.id, await formatPhotoDataUrl(photo.blob)] as const))
  return new Map(entries)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,(.*)$/s)
  if (!match) throw new Error('備份中的照片格式不正確')
  const mime = match[1] || 'application/octet-stream'
  const body = match[2]
  if (!dataUrl.includes(';base64')) return new Blob([decodeURIComponent(body)], { type: mime })
  const binary = atob(body)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new Blob([bytes], { type: mime })
}

function photoMarkup(photoUrls: Map<string, string>, id?: string, alt = '旅程照片'): string {
  const url = id ? photoUrls.get(id) : undefined
  return url ? `<img class="embedded-photo" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">` : ''
}

export async function exportEmergencyHtml(): Promise<Blob> {
  const data = await readData()
  const photoUrls = await readPhotoDataUrls()
  const trip = data.trips.find((item) => item.active) ?? data.trips[0]
  const days = data.days.filter((day) => !trip || day.tripId === trip.id).sort((a, b) => a.date.localeCompare(b.date))
  const members = data.members.filter((member) => !trip || member.tripId === trip.id)
  const lists = data.listItems.filter((item) => !trip || item.tripId === trip.id)
  const expenses = data.expenses.filter((expense) => !trip || expense.tripId === trip.id).sort((a, b) => a.date.localeCompare(b.date))
  const memberNames = new Map(members.map((member) => [member.id, member.name]))
  const activitySections = days.map((day) => {
    const activities = data.activities.filter((activity) => activity.dayId === day.id).sort((a, b) => a.time.localeCompare(b.time))
    return `<article class="day-section"><div class="day-heading"><div><h3>${escapeHtml(day.title)}</h3><p>${escapeHtml(day.date)} · ${escapeHtml(day.city)}</p></div>${photoMarkup(photoUrls, day.photoId, `${day.title}照片`)}</div>${activities.length ? `<ul>${activities.map((activity) => `<li><strong>${escapeHtml(activity.time || '待定')}　${escapeHtml(activity.title)}</strong><span>${escapeHtml(activity.locationName || activity.address || '')}</span>${activity.notes ? `<small>${escapeHtml(activity.notes)}</small>` : ''}</li>`).join('')}</ul>` : '<p class="muted">今天尚未安排活動。</p>'}</article>`
  }).join('')
  const companionSection = members.length ? members.map((member) => `<article class="companion"><div>${photoMarkup(photoUrls, member.photoId, `${member.name}照片`)}<div><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.phone || '')}${member.email ? ` · ${escapeHtml(member.email)}` : ''}</p>${member.lineAddUrl ? `<p>LINE 加好友：${escapeHtml(member.lineAddUrl)}</p>` : member.lineId ? `<p>LINE ID：${escapeHtml(member.lineId)}</p>` : ''}${member.address ? `<p>${escapeHtml(member.address)}</p>` : ''}</div></div>${photoMarkup(photoUrls, member.lineQrPhotoId, `${member.name} LINE QR Code`)}</article>`).join('') : '<p class="muted">尚未新增旅伴。</p>'
  const listSection = lists.length ? `<table><thead><tr><th>類型</th><th>項目</th><th>分類</th><th>地點</th><th>狀態</th><th>備註</th></tr></thead><tbody>${lists.map((item) => `<tr><td>${item.type === 'shopping' ? '購物' : '準備'}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.location)}</td><td>${item.completed ? '已完成' : '未完成'}</td><td>${escapeHtml(item.note)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">尚未建立購物或準備清單。</p>'
  const expenseSection = expenses.length ? `<table><thead><tr><th>日期</th><th>項目</th><th>付款人</th><th>付款方式</th><th>金額</th><th>換算</th><th>備註</th></tr></thead><tbody>${expenses.map((expense) => `<tr><td>${escapeHtml(expense.date)}</td><td>${escapeHtml(expense.category)}</td><td>${escapeHtml(memberNames.get(expense.payerId) ?? expense.payerId)}</td><td>${escapeHtml(paymentMethodLabel(expense.paymentMethod))}</td><td>${escapeHtml(formatExpense(expense))}</td><td>${expense.convertedAmountMinor != null && expense.conversionCurrency ? `${escapeHtml(String(fromMinorUnits(expense.convertedAmountMinor, expense.conversionCurrency)))} ${escapeHtml(expense.conversionCurrency)}` : ''}</td><td>${escapeHtml(expense.notes)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">尚未建立記帳資料。</p>'
  const title = trip?.title ?? '旅行應急備份'
  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}｜旅行應急備份</title><style>body{margin:0;padding:28px;color:#263244;background:#fffaf0;font:16px/1.6 system-ui,"Noto Sans TC",sans-serif}main{max-width:960px;margin:auto}h1{margin:0;color:#243b61;font-size:2rem}h2{margin:30px 0 12px;padding-bottom:6px;border-bottom:2px solid #ef8490;color:#243b61}h3{margin:0;color:#35496b}.meta,.muted{color:#68758b}.day-section,.companion{margin:12px 0;padding:16px;border:1px solid #e5d8ce;border-radius:16px;background:#fff;break-inside:avoid}.day-heading,.companion>div{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.day-section ul{margin:12px 0 0;padding:0;list-style:none}.day-section li{display:grid;gap:2px;padding:9px 0;border-top:1px solid #eee}.day-section li span,.day-section li small{color:#68758b}table{width:100%;border-collapse:collapse;background:#fff;font-size:.9rem}th,td{padding:8px;border:1px solid #e5d8ce;text-align:left;vertical-align:top}th{color:#35496b;background:#fff0f1}.embedded-photo{display:block;max-width:110px;max-height:110px;object-fit:contain;border-radius:12px;background:#f3f5f8}footer{margin-top:28px;color:#68758b;font-size:.8rem}@media print{body{padding:0;background:white}h2{break-after:avoid}}</style></head><body><main><header><h1>${escapeHtml(title)}</h1><p class="meta">目的地：${escapeHtml(trip?.destination ?? '')}　｜　${escapeHtml(trip?.startDate ?? '')} — ${escapeHtml(trip?.endDate ?? '')}</p><p class="meta">匯出時間：${escapeHtml(new Date().toLocaleString('zh-TW'))}</p></header><section><h2>每日行程</h2>${activitySections || '<p class="muted">尚未建立行程。</p>'}</section><section><h2>購物與準備</h2>${listSection}</section><section><h2>旅伴與聯絡資料</h2>${companionSection}</section><section><h2>旅行記帳</h2>${expenseSection}</section><footer>此文件由本機旅行規劃 APP 匯出，可在沒有網路的情況下閱讀。</footer></main></body></html>`
  return new Blob([html], { type: 'text/html;charset=utf-8' })
}

export async function exportEmergencyCsv(): Promise<Blob> {
  const data = await readData()
  const trip = data.trips.find((item) => item.active) ?? data.trips[0]
  const rows: string[][] = [['類型', '日期', '名稱', '地點／聯絡方式', '狀態／付款方式', '金額', '備註']]
  if (trip) rows.push(['旅程', `${trip.startDate} — ${trip.endDate}`, trip.title, trip.destination, '', '', ''])
  for (const day of data.days.filter((item) => !trip || item.tripId === trip.id)) {
    for (const activity of data.activities.filter((item) => item.dayId === day.id).sort((a, b) => a.time.localeCompare(b.time))) rows.push(['行程', `${day.date} ${activity.time}`, activity.title, activity.locationName || activity.address, '', '', activity.notes])
  }
  for (const item of data.listItems.filter((item) => !trip || item.tripId === trip.id)) rows.push([item.type === 'shopping' ? '購物' : '準備', item.dueDate ?? '', item.name, item.location, item.completed ? '已完成' : '未完成', '', item.note])
  for (const member of data.members.filter((item) => !trip || item.tripId === trip.id)) rows.push(['旅伴', '', member.name, [member.phone, member.email, member.lineId || member.lineAddUrl, member.address].filter(Boolean).join(' · '), '', '', member.notes])
  for (const expense of data.expenses.filter((item) => !trip || item.tripId === trip.id).sort((a, b) => a.date.localeCompare(b.date))) rows.push(['記帳', expense.date, expense.category, memberName(data.members, expense.payerId), paymentMethodLabel(expense.paymentMethod), formatExpense(expense), expense.notes])
  return new Blob([rows.map(csvRow).join('\r\n')], { type: 'text/csv;charset=utf-8' })
}

export async function exportEmergencyPackage(): Promise<Blob> {
  const [html, csv, json] = await Promise.all([exportEmergencyHtml(), exportEmergencyCsv(), exportBackup()])
  const files: Record<string, Uint8Array> = {
    'travel-emergency.html': strToU8(await html.text()),
    'travel-emergency.csv': strToU8(await csv.text()),
    'travel-backup.json': strToU8(await json.text()),
    'README.txt': strToU8('旅行應急備份包\r\n\r\n請先開啟 travel-emergency.html 閱讀行程資料。\r\ntravel-backup.json 可匯入旅行規劃 PWA 還原資料與照片。\r\ntravel-emergency.csv 可使用 Excel 或試算表開啟。\r\n'),
  }
  return new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' })
}

function memberName(members: Member[], id: string): string {
  return members.find((member) => member.id === id)?.name ?? id
}

function isValidPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<BackupPayload>
  if ((payload.schemaVersion !== 1 && payload.schemaVersion !== 2) || !payload.data) return false
  return ['trips', 'days', 'activities', 'members', 'expenses', 'expenseSplits', 'listItems', 'weatherCache', 'settings'].every((key) => Array.isArray((payload.data as unknown as Record<string, unknown>)[key]))
}

export async function listBackupSnapshots(): Promise<BackupSnapshot[]> {
  return db.backupSnapshots.orderBy('createdAt').reverse().toArray()
}

export async function importBackup(file: File, options: { createSnapshot?: boolean } = {}): Promise<BackupReport> {
  const payload: unknown = JSON.parse(await file.text())
  if (!isValidPayload(payload)) throw new Error('備份檔格式不正確或版本不支援')
  const { data } = payload
  if (options.createSnapshot !== false) {
    await db.backupSnapshots.put({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), blob: await exportBackup() })
  }
  await db.transaction('rw', db.tables, async () => {
    await db.trips.bulkPut(data.trips); await db.days.bulkPut(data.days); await db.activities.bulkPut(data.activities); await db.members.bulkPut(data.members); await db.expenses.bulkPut(data.expenses); await db.expenseSplits.bulkPut(data.expenseSplits); await db.listItems.bulkPut(data.listItems); await db.weatherCache.bulkPut(data.weatherCache); await db.settings.bulkPut(data.settings)
    for (const photo of payload.photos ?? []) await db.photos.put({ id: photo.id, blob: dataUrlToBlob(photo.dataUrl) })
  })
  return { inserted: Object.values(data).reduce((sum, records) => sum + records.length, 0) + (payload.photos?.length ?? 0), skippedPhotos: false }
}

export async function restoreLatestBackupSnapshot(): Promise<BackupReport | undefined> {
  const snapshot = (await listBackupSnapshots())[0]
  if (!snapshot) return undefined
  return importBackup(new File([snapshot.blob], 'snapshot.json', { type: 'application/json' }), { createSnapshot: false })
}
