import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import type { Member } from '../../domain/types'
import { IllustrationPicker } from '../../components/IllustrationPicker'
import { compressPhoto, getPhoto, savePhoto } from '../lists/photoStore'
import { getIllustration } from '../../assets/illustrations'

const memberColors = ['#ef8490', '#8ba9d6', '#78bda7', '#b19bd4', '#f4c768']

type CompanionFormProps = {
  tripId: string
  member?: Member
  onSave: (member: Member) => void | Promise<void>
  onDelete?: (member: Member) => void
  onCancel: () => void
}

function useStoredPhotoUrl(photoId?: string) {
  const [photoUrl, setPhotoUrl] = useState<string>()

  useEffect(() => {
    let objectUrl: string | undefined
    let cancelled = false

    if (photoId) {
      void getPhoto(photoId).then((blob) => {
        if (!blob || cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPhotoUrl(objectUrl)
      })
    }

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoId])

  return photoUrl
}

export function CompanionForm({ tripId, member, onSave, onDelete, onCancel }: CompanionFormProps) {
  const [name, setName] = useState(member?.name ?? '')
  const [illustrationId, setIllustrationId] = useState<Member['illustrationId']>(member?.illustrationId ?? 'hanbok-woman')
  const [photo, setPhoto] = useState<File>()
  const [removePhoto, setRemovePhoto] = useState(false)
  const photoPreviewUrl = useMemo(() => photo ? URL.createObjectURL(photo) : undefined, [photo])
  const storedPhotoUrl = useStoredPhotoUrl(member?.photoId)
  const fallbackIllustration = getIllustration(illustrationId)
  const displayedPhotoUrl = removePhoto ? undefined : (photoPreviewUrl ?? storedPhotoUrl)
  const isEditing = Boolean(member)

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    }
  }, [photoPreviewUrl])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return

    const id = member?.id ?? crypto.randomUUID()
    const photoId = photo ? `${id}-photo-${Date.now()}` : (removePhoto ? undefined : member?.photoId)
    if (photo && photoId) await savePhoto(photoId, await compressPhoto(photo))

    const nextMember: Member = {
      id,
      tripId,
      name: name.trim(),
      color: member?.color ?? memberColors[Date.now() % memberColors.length],
      illustrationId,
      notes: member?.notes ?? '',
    }
    if (photoId) nextMember.photoId = photoId

    await onSave(nextMember)
  }

  return (
    <div className="modal-backdrop">
      <form className="activity-form companion-form" onSubmit={(event) => void submit(event)}>
        <div className="form-heading">
          <div>
            <p className="eyebrow">{isEditing ? 'EDIT TRAVEL COMPANION' : 'NEW TRAVEL COMPANION'}</p>
            <h2>{isEditing ? '編輯旅伴' : '新增旅伴'}</h2>
          </div>
          <button type="button" onClick={onCancel} aria-label="關閉">×</button>
        </div>

        <label>
          旅伴名稱
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：小美" autoFocus />
        </label>

        <div className="companion-photo-preview">
          <div className="companion-preview-avatar">
            {displayedPhotoUrl ? <img src={displayedPhotoUrl} alt="旅伴圖片預覽" /> : <span>{fallbackIllustration.emoji}</span>}
          </div>
          <div>
            <strong>{photo ? photo.name : (storedPhotoUrl && !removePhoto ? '目前旅伴圖片' : '尚未選擇照片')}</strong>
            <span>{photo ? '儲存後會以新圖片取代目前圖片' : '也可以使用下方的預設頭像'}</span>
          </div>
        </div>

        <label className="companion-upload">
          <ImagePlus size={20} aria-hidden="true" />
          <span>{isEditing ? '更換旅伴圖片' : '上傳旅伴圖片'} <small>（選填）</small></span>
          <input type="file" accept="image/*" onChange={(event) => { setPhoto(event.target.files?.[0]); setRemovePhoto(false) }} />
        </label>

        {isEditing && (member?.photoId || photo) && !removePhoto && (
          <button className="companion-clear-photo-button" type="button" onClick={() => { setPhoto(undefined); setRemovePhoto(true) }}>
            移除目前圖片
          </button>
        )}

        <label>
          預設頭像
          <IllustrationPicker value={illustrationId} onChange={(value) => setIllustrationId(value as Member['illustrationId'])} />
        </label>

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onCancel}>取消</button>
          <button type="submit" className="button-primary">{isEditing ? '儲存變更' : '儲存旅伴'}</button>
        </div>
        {isEditing && member && onDelete && (
          <button type="button" className="button-danger delete-expense-button" onClick={() => { if (window.confirm(`確定要刪除「${member.name}」嗎？刪除後無法復原。`)) onDelete(member) }}>
            刪除此旅伴
          </button>
        )}
      </form>
    </div>
  )
}
