import { ArrowDown, ArrowUp, Map } from 'lucide-react'
import type { Activity } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { buildMapSearchUrl } from '../../integrations/maps/mapUrls'
import { IllustrationArtwork } from '../../components/IllustrationArtwork'
import { formatWalkDuration, type RouteEstimate } from './routeEstimate'

export function ActivityCard({ activity, onEdit, nextStop, routeEstimate, onMoveUp, onMoveDown }: { activity: Activity; onEdit: (id: string) => void; nextStop?: string; routeEstimate?: RouteEstimate; onMoveUp?: () => void; onMoveDown?: () => void }) {
  const illustration = getIllustration(activity.illustrationId)
  const settings = useLiveQuery(() => db.settings.get('global'), [], undefined)
  const mapProvider = settings?.mapProvider === 'naver' || settings?.mapProvider === 'apple' ? settings.mapProvider : 'google'
  const mapQuery = activity.address || activity.locationName || activity.title
  const mapLabel = mapProvider === 'naver' ? 'Naver Map' : mapProvider === 'apple' ? 'Apple 地圖' : 'Google Maps'
  const mapUrl = mapProvider === 'google' ? (activity.googleMapsUrl || buildMapSearchUrl(mapQuery, 'google')) : buildMapSearchUrl(mapQuery, mapProvider)
  return <article className="activity-card">
    <button className="activity-card-main" type="button" aria-label={`編輯行程 ${activity.title}`} onClick={() => onEdit(activity.id)}>
      <div className="activity-time">{activity.time || '待定'}</div>
      <div className="activity-mark"><IllustrationArtwork illustration={illustration} decorative /></div>
      <div className="activity-info"><strong>{activity.title}</strong><span>{activity.locationName || activity.type}</span>{routeEstimate && nextStop && <small className="activity-route-estimate"><span className="activity-route-distance">距{nextStop}約 {routeEstimate.distanceKm} km</span><span className="activity-route-separator"> · </span><span className="activity-route-walk">步行約 {formatWalkDuration(routeEstimate.walkMinutes)}</span></small>}{activity.notes && <small>{activity.notes}</small>}</div>
    </button>
    <div className="activity-actions">
      {onMoveUp && <button type="button" aria-label={`將${activity.title}上移`} onClick={onMoveUp}><ArrowUp size={16} /></button>}
      {onMoveDown && <button type="button" aria-label={`將${activity.title}下移`} onClick={onMoveDown}><ArrowDown size={16} /></button>}
      <a href={mapUrl} target="_blank" rel="noreferrer" aria-label={`在 ${mapLabel} 開啟 ${activity.title}`}><Map size={18} /></a>
    </div>
  </article>
}
