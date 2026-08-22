import { useEffect, useState } from 'react'
import { CalendarDays, MoreVertical } from 'lucide-react'
import type { ListItem } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'
import { getAllPhotoIds, getPhoto } from './photoStore'
import { PhotoLightbox } from './PhotoLightbox'

export function ListItemCard({ item, onToggle, onEdit, onDelete }: { item: ListItem; onToggle: (id: string) => void; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const illustration = getIllustration(item.illustrationId)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const photoIds = getAllPhotoIds(item)
  const firstUrl = photoIds.length ? photoUrls[photoIds[0]] : undefined

  useEffect(() => {
    if (!photoIds.length) {
      setPhotoUrls({})
      return
    }
    let cancelled = false
    const urls: Record<string, string> = {}
    void Promise.all(
      photoIds.map(async (id) => {
        const blob = await getPhoto(id)
        if (!blob || cancelled) return
        urls[id] = URL.createObjectURL(blob)
      }),
    ).then(() => {
      if (!cancelled) setPhotoUrls({ ...urls })
    })
    return () => {
      cancelled = true
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u))
    }
  }, [photoIds.join('|')])

  const allUrls = photoIds.map((id) => photoUrls[id]).filter(Boolean) as string[]
  return (
    <>
      <article className={item.completed ? 'list-item-card is-complete' : 'list-item-card'}>
        <button className="list-checkbox" type="button" aria-label={`${item.completed ? '取消完成' : '完成'} ${item.name}`} onClick={() => onToggle(item.id)}>{item.completed ? '✓' : ''}</button>
        {photoIds.length ? (
          firstUrl ? (
            <button type="button" className="list-photo has-photo" aria-label={`預覽 ${item.name} 照片（共 ${photoIds.length} 張）`} onClick={() => setLightboxIndex(0)}>
              <img src={firstUrl} alt={`${item.name} 照片`} />
              {photoIds.length > 1 && <span className="photo-count">+{photoIds.length}</span>}
            </button>
          ) : (
            <div className="list-photo" aria-hidden="true">📷</div>
          )
        ) : (
          <div className="list-photo" aria-hidden="true">{illustration.emoji}</div>
        )}
        <button className="list-item-main" type="button" aria-label={`編輯 ${item.name}`} onClick={() => onEdit(item.id)}><div className="list-item-info"><strong>{item.name}</strong><div><span className="item-tag">{item.category}</span>{item.priority === 'important' && <span className="item-tag important">重要</span>}</div>{item.note && <small>{item.note}</small>}{item.dueDate && <small className="item-date"><CalendarDays size={13} />{item.dueDate}</small>}</div></button>
        <button className="list-menu" type="button" aria-label={`刪除 ${item.name}`} onClick={() => onDelete(item.id)}><MoreVertical size={19} /></button>
      </article>
      {lightboxIndex !== null && allUrls.length > 0 && <PhotoLightbox urls={allUrls} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
    </>
  )
}
