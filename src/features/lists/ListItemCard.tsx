import { CalendarDays, Trash2 } from 'lucide-react'
import type { ListItem } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'

type ListItemCardProps = {
  item: ListItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function ListItemCard({ item, onToggle, onDelete }: ListItemCardProps) {
  const illustration = getIllustration(item.illustrationId)
  const cardClassName = [
    'list-item-card',
    item.completed && 'is-complete',
    item.priority === 'important' && 'is-important',
  ].filter(Boolean).join(' ')

  return (
    <article className={cardClassName}>
      <div className="list-item-card-content">
        <button className="list-checkbox" type="button" aria-label={`${item.completed ? '取消完成' : '完成'} ${item.name}`} onClick={() => onToggle(item.id)}>
          {item.completed ? '✓' : ''}
        </button>
        {item.photoId ? <div className="list-photo" aria-hidden="true">📷</div> : <div className="list-photo" aria-hidden="true">{illustration.emoji}</div>}
        <div className="list-item-info">
          <strong>{item.name}</strong>
          <div>
            <span className="item-tag">{item.category}</span>
            {item.priority === 'important' && <span className="item-tag important">重要</span>}
          </div>
          {item.note && <small>{item.note}</small>}
          {item.dueDate && <small className="item-date"><CalendarDays size={13} />{item.dueDate}</small>}
        </div>
      </div>
      <div className="list-item-card-actions">
        <button className="list-delete-button" type="button" onClick={() => onDelete(item.id)}>
          <Trash2 size={16} aria-hidden="true" />刪除項目
        </button>
      </div>
    </article>
  )
}
