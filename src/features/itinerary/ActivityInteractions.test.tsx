import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Activity } from '../../domain/types'
import { ActivityCard } from './ActivityCard'
import { ActivityForm } from './ActivityForm'

const activity: Activity = {
  id: 'activity-1',
  tripId: 'trip-1',
  dayId: 'day-1',
  date: '2026-08-25',
  time: '10:00',
  type: 'spot',
  title: '景福宮',
  locationName: '首爾',
  address: '161 Sajik-ro, Jongno-gu, Seoul',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gyeongbokgung',
  notes: '上午參觀',
  order: 1,
  illustrationId: 'hanbok-woman',
}

afterEach(() => vi.restoreAllMocks())

describe('行程卡片互動', () => {
  it('點擊卡片主體會進入編輯，並保留獨立的地圖圖標入口', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<ActivityCard activity={activity} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: '編輯行程 景福宮' }))

    expect(onEdit).toHaveBeenCalledWith(activity.id)
    expect(screen.getByRole('link', { name: '在 Google Maps 開啟 景福宮' })).toHaveAttribute('href', activity.googleMapsUrl)
    expect(screen.queryByRole('button', { name: '刪除 景福宮' })).not.toBeInTheDocument()
  })

  it('將距離與步行時間分開呈現，且超過一小時使用小時格式', () => {
    render(<ActivityCard activity={activity} onEdit={vi.fn()} nextStop="晴空塔" routeEstimate={{ distanceKm: 3894.1, walkMinutes: 100 }} />)

    expect(screen.getByText('距晴空塔約 3894.1 km')).toBeInTheDocument()
    expect(screen.getByText('步行約 1 小時 40 分')).toBeInTheDocument()
    expect(screen.getByText('距晴空塔約 3894.1 km')).toHaveClass('activity-route-distance')
    expect(screen.getByText('步行約 1 小時 40 分')).toHaveClass('activity-route-walk')
  })

  it('僅在編輯既有行程時於表單內顯示垃圾桶刪除按鈕', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" initial={activity} onSave={vi.fn()} onDelete={onDelete} onCancel={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '移除這個行程' }))

    expect(window.confirm).toHaveBeenCalledWith('確定要移除「景福宮」嗎？')
    expect(onDelete).toHaveBeenCalledWith(activity.id)
  })
})
