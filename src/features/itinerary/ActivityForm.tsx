import { useState } from 'react'
import type { Activity, ActivityType } from '../../domain/types'
import { buildGoogleMapsSearchUrl } from '../../integrations/maps/googleMapsUrl'
import { IllustrationPicker } from '../../components/IllustrationPicker'

export function ActivityForm({ tripId, dayId, date, onSave, onCancel }: { tripId: string; dayId: string; date: string; onSave: (activity: Activity) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('10:00')
  const [type, setType] = useState<ActivityType>('spot')
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [illustrationId, setIllustrationId] = useState('hanbok-woman')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) return
    const id = crypto.randomUUID()
    onSave({ id, tripId, dayId, date, time, type, title: title.trim(), locationName: locationName.trim(), address: address.trim(), googleMapsUrl: buildGoogleMapsSearchUrl(address || locationName || title), notes: notes.trim(), order: Date.now(), illustrationId })
  }

  return <div className="modal-backdrop"><form className="activity-form" onSubmit={submit}>
    <div className="form-heading"><div><p className="eyebrow">NEW ACTIVITY</p><h2>新增行程</h2></div><button type="button" onClick={onCancel} aria-label="關閉">×</button></div>
    <label>名稱<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：景福宮參觀" /></label>
    <div className="form-grid"><label>時間<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label>分類<select value={type} onChange={(event) => setType(event.target.value as ActivityType)}><option value="spot">景點</option><option value="food">美食</option><option value="transit">交通</option><option value="stay">住宿</option><option value="other">其他</option></select></label></div>
    <label>地點<input value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="輸入地點名稱" /></label>
    <label>地址／搜尋關鍵字<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="可用來開啟 Google Maps" /></label>
    <label>備註<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="營業時間、預約資訊或提醒" rows={3} /></label>
    <label>選擇圖案<IllustrationPicker value={illustrationId} onChange={setIllustrationId} /></label>
    <div className="form-actions"><button type="button" className="button-secondary" onClick={onCancel}>取消</button><button type="submit" className="button-primary">儲存行程</button></div>
  </form></div>
}
