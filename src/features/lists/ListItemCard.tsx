import { CalendarDays, MoreVertical } from 'lucide-react'
import type { ListItem } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'

export function ListItemCard({ item, onToggle, onDelete }: { item: ListItem; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const illustration = getIllustration(item.illustrationId)
  return <article className={item.completed ? 'list-item-card is-complete' : 'list-item-card'}><button className="list-checkbox" type="button" aria-label={`${item.completed ? '取消完成' : '完成'} ${item.name}`} onClick={() => onToggle(item.id)}>{item.completed ? '✓' : ''}</button>{item.photoId ? <div className="list-photo" aria-hidden="true">📷</div> : <div className="list-photo" aria-hidden="true">{illustration.emoji}</div>}<div className="list-item-info"><strong>{item.name}</strong><div><span className="item-tag">{item.category}</span>{item.priority === 'important' && <span className="item-tag important">重要</span>}</div>{item.note && <small>{item.note}</small>}{item.dueDate && <small className="item-date"><CalendarDays size={13} />{item.dueDate}</small>}</div><button className="list-menu" type="button" aria-label={`刪除 ${item.name}`} onClick={() => onDelete(item.id)}><MoreVertical size={19} /></button></article>
}
