import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Activity } from '../../domain/types'
import { ActivityForm } from './ActivityForm'

const baseActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'activity-1',
  tripId: 'trip-1',
  dayId: 'day-1',
  date: '2026-08-25',
  time: '10:00',
  type: 'spot',
  title: '東京鐵塔',
  locationName: '東京鐵塔',
  address: '東京鐵塔',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tokyo+Tower',
  notes: '上午參觀',
  order: 1,
  illustrationId: 'namsan-tower',
  ...overrides,
})

describe('行程表單欄位同步', () => {
  it.each([
    ['spot', 'namsan-tower', '景點'],
    ['food', 'food-bibimbap', '美食'],
    ['transit', 'transit-subway', '交通'],
    ['stay', 'hanok-stay', '住宿'],
  ] as const)('新增行程分類為%s時預設圖案與瀏覽分類正確', async (type, illustrationId, categoryLabel) => {
    const user = userEvent.setup()
    render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.selectOptions(screen.getByRole('combobox', { name: '分類' }), type)
    const illustrationLabel = illustrationId === 'namsan-tower' ? '南山塔' : illustrationId === 'food-bibimbap' ? '石鍋拌飯' : illustrationId === 'transit-subway' ? '可愛地鐵' : '韓屋住宿'
    expect(screen.getAllByText(illustrationLabel)[0]).toBeInTheDocument()
    await user.click(screen.getByText('瀏覽其他圖案'))
    expect(screen.getByRole('tab', { name: categoryLabel })).toBeInTheDocument()
  })

  it('手動選擇圖案後，切換分類不會覆蓋手動選擇', async () => {
    const user = userEvent.setup()
    render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.click(screen.getByText('瀏覽其他圖案'))
    await user.click(screen.getByRole('button', { name: '景福宮' }))
    await user.selectOptions(screen.getByRole('combobox', { name: '分類' }), 'food')

    expect(screen.getAllByText('景福宮')[0]).toBeInTheDocument()
  })

  it('輸入名稱時會同步填入地點與地址，且名稱修改後會更新自動帶入欄位', async () => {
    const user = userEvent.setup()
    render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: '名稱' }), '東京鐵塔')

    expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('東京鐵塔')
    expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('東京鐵塔')

    await user.clear(screen.getByRole('textbox', { name: '名稱' }))
    await user.type(screen.getByRole('textbox', { name: '名稱' }), '晴空塔')

    expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('晴空塔')
    expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('晴空塔')
  })

  it('使用者手動修改地點或地址後，名稱變更不會覆蓋手動內容', async () => {
    const user = userEvent.setup()
    render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: '名稱' }), '東京鐵塔')
    await user.clear(screen.getByRole('textbox', { name: '地點' }))
    await user.type(screen.getByRole('textbox', { name: '地點' }), '赤羽橋站')
    await user.clear(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' }))
    await user.type(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' }), '東京都港區芝公園4-2-8')
    await user.clear(screen.getByRole('textbox', { name: '名稱' }))
    await user.type(screen.getByRole('textbox', { name: '名稱' }), '晴空塔')

    expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('赤羽橋站')
    expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('東京都港區芝公園4-2-8')
  })

  it('編輯既有名稱、地點、地址都相同的資料時，修改名稱會同步更新三個欄位', async () => {
    const user = userEvent.setup()
    render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" initial={baseActivity()} onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.clear(screen.getByRole('textbox', { name: '名稱' }))
    await user.type(screen.getByRole('textbox', { name: '名稱' }), '晴空塔')

    expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('晴空塔')
    expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('晴空塔')
  })

  it('編輯時只手動修改地點後，地址仍會跟著名稱同步更新', async () => {
    const user = userEvent.setup()
    render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" initial={baseActivity()} onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.clear(screen.getByRole('textbox', { name: '地點' }))
    await user.type(screen.getByRole('textbox', { name: '地點' }), '赤羽橋站')
    await user.clear(screen.getByRole('textbox', { name: '名稱' }))
    await user.type(screen.getByRole('textbox', { name: '名稱' }), '晴空塔')

    expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('赤羽橋站')
    expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('晴空塔')
  })

  it('編輯既有自訂地點與地址時，修改名稱不會覆蓋既有值', async () => {
    const user = userEvent.setup()
    render(
      <ActivityForm
        tripId="trip-1"
        dayId="day-1"
        date="2026-08-25"
        initial={baseActivity({ locationName: '首爾', address: '161 Sajik-ro, Jongno-gu, Seoul' })}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: '名稱' }))
    await user.type(screen.getByRole('textbox', { name: '名稱' }), '景福宮')

    expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('首爾')
    expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('161 Sajik-ro, Jongno-gu, Seoul')
  })
})
