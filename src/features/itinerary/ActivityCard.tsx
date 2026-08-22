import { Map } from 'lucide-react'
import type { Activity } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { buildMapSearchUrl } from '../../integrations/maps/mapUrls'

export function ActivityCard({ activity, onEdit }: { activity: Activity; onEdit: (id: string) => void }) {
  const illustration = getIllustration(activity.illustrationId)
  const settings = useLiveQuery(() => db.settings.get('global'), [], undefined)
  const mapProvider = settings?.mapProvider === 'naver' || settings?.mapProvider === 'apple' ? settings.mapProvider : 'google'
  const mapQuery = activity.address || activity.locationName || activity.title
  const mapLabel = mapProvider === 'naver' ? 'Naver Map' : mapProvider === 'apple' ? 'Apple 地圖' : 'Google Maps'
  const mapUrl = mapProvider === 'google' ? (activity.googleMapsUrl || buildMapSearchUrl(mapQuery, 'google')) : buildMapSearchUrl(mapQuery, mapProvider)
  return <article className="activity-card">
    <button className="activity-card-main" type="button" aria-label={`編輯行程 ${activity.title}`} onClick={() => onEdit(activity.id)}>
      <div className="activity-time">{activity.time || '待定'}</div>
      <div className="activity-mark" aria-hidden="true">{illustration.emoji}</div>
      <div className="activity-info"><strong>{activity.title}</strong><span>{activity.locationName || activity.type}</span>{activity.notes && <small>{activity.notes}</small>}</div>
    </button>
    <div className="activity-actions">
      <a href={mapUrl} target="_blank" rel="noreferrer" aria-label={`在 ${mapLabel} 開啟 ${activity.title}`}><Map size={18} /></a>
    </div>
  </article>
}
