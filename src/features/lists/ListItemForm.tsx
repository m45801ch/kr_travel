import { useEffect, useState } from 'react'
import type { ListItem, ListType, Member } from '../../domain/types'
import { IllustrationPicker } from '../../components/IllustrationPicker'
import { compressPhoto, deletePhoto, getAllPhotoIds, getPhoto, savePhoto } from './photoStore'
import { PhotoLightbox } from './PhotoLightbox'

export function ListItemForm({ type, tripId, members, initial, onSave, onDelete, onCancel }: { type: ListType; tripId: string; members: Member[]; initial?: ListItem; onSave: (item: ListItem) => void; onDelete?: (id: string) => void; onCancel: () => void }) {
  const isEditing = Boolean(initial)
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? (type === 'shopping' ? '一般' : '行前準備'))
  const [priority, setPriority] = useState<'normal' | 'important'>(initial?.priority ?? 'normal')
  const [note, setNote] = useState(initial?.note ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '')
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? '')
  const [illustrationId, setIllustrationId] = useState(initial?.illustrationId ?? (type === 'shopping' ? 'shopping-bag' : 'airport-travel'))
  const [keptIds, setKeptIds] = useState<string[]>(() => (initial ? getAllPhotoIds(initial) : []))
  const [existingUrls, setExistingUrls] = useState<Record<string, string>>({})
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newUrls, setNewUrls] = useState<string[]>([])
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null)

  useEffect(() => {
    setKeptIds(initial ? getAllPhotoIds(initial) : [])
    setNewFiles([])
  }, [initial?.id])

  useEffect(() => {
    if (!keptIds.length) {
      setExistingUrls({})
      return
    }
    let cancelled = false
    const urls: Record<string, string> = {}
    void Promise.all(
      keptIds.map(async (id) => {
        const blob = await getPhoto(id)
        if (!blob || cancelled) return
        urls[id] = URL.createObjectURL(blob)
      }),
    ).then(() => {
      if (!cancelled) setExistingUrls({ ...urls })
    })
    return () => {
      cancelled = true
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u))
    }
  }, [keptIds.join('|')])

  useEffect(() => {
    if (!newFiles.length) {
      setNewUrls([])
      return
    }
    const urls = newFiles.map((f) => URL.createObjectURL(f))
    setNewUrls(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [newFiles])

  const removeExisting = (id: string) => setKeptIds((prev) => prev.filter((x) => x !== id))
  const removeNew = (index: number) => setNewFiles((prev) => prev.filter((_, i) => i !== index))

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return
    const originalIds = initial ? getAllPhotoIds(initial) : []
    const removedIds = originalIds.filter((id) => !keptIds.includes(id))
    for (const id of removedIds) await deletePhoto(id)

    const newIds: string[] = []
    const targetId = initial?.id ?? crypto.randomUUID()
    for (const file of newFiles) {
      const photoId = `${targetId}-photo-${crypto.randomUUID()}`
      await savePhoto(photoId, await compressPhoto(file))
      newIds.push(photoId)
    }
    const finalIds = [...keptIds, ...newIds]

    if (isEditing && initial) {
      onSave({
        ...initial,
        name: name.trim(),
        category,
        note,
        priority,
        location,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
        illustrationId,
        photoId: finalIds[0],
        photoIds: finalIds.length ? finalIds : undefined,
      })
      return
    }
    onSave({
      id: targetId,
      tripId,
      type,
      name: name.trim(),
      category,
      note,
      priority,
      location,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
      illustrationId,
      completed: false,
      order: Date.now(),
      photoId: finalIds[0],
      photoIds: finalIds.length ? finalIds : undefined,
    })
  }

  const hasPhotos = keptIds.length > 0 || newFiles.length > 0
  const existingOrderedUrls = keptIds.map((id) => existingUrls[id]).filter(Boolean) as string[]
  const allLightboxUrls = [...existingOrderedUrls, ...newUrls]

  return <div className="modal-backdrop"><form className="activity-form" onSubmit={(event) => void submit(event)}><div className="form-heading"><div><p className="eyebrow">{isEditing ? 'EDIT' : 'NEW'} {type.toUpperCase()}</p><h2>{isEditing ? (type === 'shopping' ? '編輯購物' : '編輯準備事項') : type === 'shopping' ? '新增購物' : '新增準備事項'}</h2></div><button type="button" onClick={onCancel} aria-label="關閉">×</button></div><label>名稱<input required value={name} onChange={(event) => setName(event.target.value)} placeholder={type === 'shopping' ? '例如：Olive Young 面膜' : '例如：護照'} /></label><div className="form-grid"><label>分類<input value={category} onChange={(event) => setCategory(event.target.value)} /></label><label>重要程度<select value={priority} onChange={(event) => setPriority(event.target.value as 'normal' | 'important')}><option value="normal">一般</option><option value="important">重要</option></select></label></div>{type === 'shopping' && <label>購買地點<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="例如：弘大商圈" /></label>}<div className="form-grid"><label>期限<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label>指派旅伴<select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">未指派</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label></div><label>備註<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>{type === 'shopping' && <label>照片<input type="file" accept="image/*" multiple onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) setNewFiles((prev) => [...prev, ...files]); event.currentTarget.value = '' }} />{hasPhotos && <div className="photo-preview-grid">{keptIds.map((id, idx) => existingUrls[id] && <div key={id} className="photo-preview-item"><button type="button" className="photo-preview-open" aria-label={`預覽照片 ${idx + 1}`} onClick={() => setLightbox({ urls: allLightboxUrls, index: idx })}><img src={existingUrls[id]} alt="已儲存照片" /></button><button type="button" className="photo-remove" onClick={() => removeExisting(id)} aria-label="移除照片">×</button></div>)}{newFiles.map((file, i) => newUrls[i] && <div key={`${file.name}-${i}`} className="photo-preview-item is-new"><button type="button" className="photo-preview-open" aria-label={`預覽新照片 ${i + 1}`} onClick={() => setLightbox({ urls: allLightboxUrls, index: existingOrderedUrls.length + i })}><img src={newUrls[i]} alt={`新照片 ${i + 1}`} /></button><button type="button" className="photo-remove" onClick={() => removeNew(i)} aria-label="移除新照片">×</button></div>)}</div>}{hasPhotos ? <small>{keptIds.length + newFiles.length} 張照片{newFiles.length ? `（新增 ${newFiles.length} 張）` : ''}</small> : <small>可一次選擇多張照片，儲存後會完整呈現</small>}</label>}<label>圖案<IllustrationPicker value={illustrationId} onChange={setIllustrationId} /></label><div className="form-actions"><button type="button" className="button-secondary" onClick={onCancel}>取消</button><button type="submit" className="button-primary">{isEditing ? '儲存修改' : '儲存'}</button></div>{isEditing && initial && onDelete && <button type="button" className="button-danger delete-expense-button" onClick={() => { if (window.confirm(`確定要移除「${initial.name}」嗎？`)) onDelete(initial.id) }}>刪除此項目</button>}</form>{lightbox && <PhotoLightbox urls={lightbox.urls} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />}</div>
}
