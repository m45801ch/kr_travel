import { Download, Upload } from 'lucide-react'
import { exportBackup, importBackup } from '../../data/backup'

export function BackupControls({ onImported }: { onImported: () => void }) {
  const download = async () => { const url = URL.createObjectURL(await exportBackup()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `korea-travel-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url) }
  const upload = async (file?: File) => { if (!file) return; await importBackup(file); onImported() }
  return <section className="settings-card"><h2>資料備份</h2><p>資料只存在這台裝置，建議定期備份。</p><div className="backup-actions"><button type="button" onClick={() => void download()}><Download size={18} />匯出資料</button><label><Upload size={18} />匯入資料<input type="file" accept="application/json" onChange={(event) => void upload(event.target.files?.[0])} /></label></div></section>
}
