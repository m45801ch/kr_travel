import type { TripDay } from '../../domain/types'

const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

export function DateStrip({ days, selectedDate, onSelect }: { days: TripDay[]; selectedDate: string; onSelect: (date: string) => void }) {
  return (
    <div className="date-strip" aria-label="選擇行程日期">
      {days.map((day) => {
        const date = new Date(`${day.date}T00:00:00`)
        const active = selectedDate === day.date
        return <button className={active ? 'date-tile is-active' : 'date-tile'} key={day.id} type="button" onClick={() => onSelect(day.date)}>
          <span>{weekdays[date.getDay()]}</span><strong>{date.getDate()}</strong><small>{day.city}</small>
        </button>
      })}
    </div>
  )
}
