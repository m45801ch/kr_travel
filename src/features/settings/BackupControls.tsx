import { Download, FileText, Package, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { exportBackup, exportEmergencyPackage, exportItinerarySnapshotHtml, importBackup, listBackupSnapshots, restoreLatestBackupSnapshot } from '../../data/backup'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function BackupControls({ onImported }: { onImported: () => void }) {
  const [status, setStatus] = useState('')
  const [hasSnapshot, setHasSnapshot] = useState(false)
  useEffect(() => { void listBackupSnapshots().then((snapshots) => setHasSnapshot(snapshots.length > 0)) }, [])
  const stamp = () => new Date().toISOString().slice(0, 10)

  const downloadJson = async () => {
    downloadBlob(await exportBackup(), `travel-backup-${stamp()}.json`)
    setStatus('JSON 完整備份已匯出。')
  }

  const downloadEmergency = async () => {
    setStatus('正在整理本機資料…')
    try {
      downloadBlob(await exportEmergencyPackage(), `travel-emergency-${stamp()}.zip`)
      setStatus('已匯出旅行應急 ZIP，內含 HTML、CSV、JSON 與照片資料。')
    } catch {
      setStatus('匯出失敗，請稍後再試。')
    }
  }

  const downloadSnapshot = async () => {
    setStatus('正在製作離線行程快照…')
    try {
      downloadBlob(await exportItinerarySnapshotHtml(), `itinerary-snapshot-${stamp()}.html`)
      setStatus('已匯出可離線開啟的唯讀 HTML 行程快照。')
    } catch {
      setStatus('行程快照匯出失敗，請稍後再試。')
    }
  }

  const upload = async (file?: File) => {
    if (!file) return
    try {
      const payload = JSON.parse(await file.text()) as { data?: Record<string, unknown>; photos?: unknown[] }
      const recordCount = Object.values(payload.data ?? {}).filter(Array.isArray).reduce((total, records) => total + records.length, 0) + (payload.photos?.length ?? 0)
      if (!window.confirm(`這份備份包含 ${recordCount} 筆資料，匯入後會更新相同 ID 的項目，確定繼續嗎？`)) {
        setStatus('已取消匯入。')
        return
      }
      await importBackup(file)
      setHasSnapshot(true)
      setStatus('匯入完成，正在重新載入…')
      onImported()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '匯入失敗。')
    }
  }

  const restoreSnapshot = async () => {
    if (!window.confirm('確定要還原匯入前的本機快照嗎？目前資料會被快照內容更新。')) return
    const report = await restoreLatestBackupSnapshot()
    if (!report) { setStatus('目前沒有可還原的快照。'); return }
    setStatus(`已還原 ${report.inserted} 筆資料，正在重新載入…`)
    onImported()
  }

  return <section className="settings-card">
    <h2>資料備份</h2>
    <p>資料只存在這台裝置；建議出發前匯出旅行應急包。</p>
    <div className="backup-actions">
      <button className="backup-emergency-button" type="button" onClick={() => void downloadEmergency()}><Package size={18} />匯出旅行應急包</button>
      <button type="button" onClick={() => void downloadSnapshot()}><FileText size={18} />匯出行程快照 HTML</button>
      <button type="button" onClick={() => void downloadJson()}><Download size={18} />匯出 JSON</button>
      <label><Upload size={18} />匯入 JSON<input type="file" accept="application/json" onChange={(event) => void upload(event.target.files?.[0])} /></label>
      {hasSnapshot && <button type="button" onClick={() => void restoreSnapshot()}>還原上次匯入前快照</button>}
    </div>
    {status && <p className="backup-status" role="status">{status}</p>}
    <small className="backup-help">ZIP 內含可離線閱讀的 HTML、試算表 CSV、可還原 JSON，以及照片與 LINE QR Code。</small>
  </section>
}
