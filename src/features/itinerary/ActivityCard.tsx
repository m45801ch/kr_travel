import { Edit3, ExternalLink, MoreVertical } from 'lucide-react'
import type { Activity } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'

export function ActivityCard({ activity, onDelete, onEdit }: { activity: Activity; onDelete: (id: string) => void; onEdit?: (id: string) => void }) {
  const illustration = getIllustration(activity.illustrationId)
  return <article className="activity-card">
    <div className="activity-time">{activity.time || '待定'}</div>
    <div className="activity-mark" aria-hidden="true">{illustration.emoji}</div>
    <div className="activity-info"><strong>{activity.title}</strong><span>{activity.locationName || activity.type}</span>{activity.notes && <small>{activity.notes}</small>}</div>
    <div className="activity-actions">
      {onEdit && <button type="button" aria-label={`編輯 ${activity.title}`} onClick={() => onEdit(activity.id)}><Edit3 size={16} /></button>}
      <a href={activity.googleMapsUrl} target="_blank" rel="noreferrer" aria-label={`在 Google Maps 開啟 ${activity.title}`}><ExternalLink size={17} /></a>
      <button type="button" aria-label={`刪除 ${activity.title}`} onClick={() => onDelete(activity.id)}><MoreVertical size={19} /></button>
    </div>
  </article>
}
