import { useState } from 'react'
import type { ListItem, ListType, Member } from '../../domain/types'
import { IllustrationPicker } from '../../components/IllustrationPicker'
import { compressPhoto, savePhoto } from './photoStore'

export function ListItemForm({ type, tripId, members, onSave, onCancel }: { type: ListType; tripId: string; members: Member[]; onSave: (item: ListItem) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(type === 'shopping' ? '一般' : '行前準備')
  const [priority, setPriority] = useState<'normal' | 'important'>('normal')
  const [note, setNote] = useState('')
  const [location, setLocation] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [illustrationId, setIllustrationId] = useState(type === 'shopping' ? 'shopping-bag' : 'airport-travel')
  const [photo, setPhoto] = useState<File>()

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return
    const id = crypto.randomUUID()
    const photoId = photo ? `${id}-photo` : undefined
    if (photo && photoId) await savePhoto(photoId, await compressPhoto(photo))
    onSave({ id, tripId, type, name: name.trim(), category, note, priority, location, dueDate: dueDate || undefined, assigneeId: assigneeId || undefined, illustrationId, completed: false, order: Date.now(), photoId })
  }

  return <div className="modal-backdrop"><form className="activity-form" onSubmit={(event) => void submit(event)}><div className="form-heading"><div><p className="eyebrow">NEW {type.toUpperCase()}</p><h2>{type === 'shopping' ? '新增購物' : '新增準備事項'}</h2></div><button type="button" onClick={onCancel} aria-label="關閉">×</button></div><label>名稱<input required value={name} onChange={(event) => setName(event.target.value)} placeholder={type === 'shopping' ? '例如：Olive Young 面膜' : '例如：護照'} /></label><div className="form-grid"><label>分類<input value={category} onChange={(event) => setCategory(event.target.value)} /></label><label>重要程度<select value={priority} onChange={(event) => setPriority(event.target.value as 'normal' | 'important')}><option value="normal">一般</option><option value="important">重要</option></select></label></div>{type === 'shopping' && <label>購買地點<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="例如：弘大商圈" /></label>}<div className="form-grid"><label>期限<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label>指派旅伴<select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">未指派</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label></div><label>備註<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>{type === 'shopping' && <label>照片<input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0])} /></label>}<label>圖案<IllustrationPicker value={illustrationId} onChange={setIllustrationId} /></label><div className="form-actions"><button type="button" className="button-secondary" onClick={onCancel}>取消</button><button type="submit" className="button-primary">儲存</button></div></form></div>
}
