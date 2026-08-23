import { describe, expect, it } from 'vitest'
import type { Activity, Expense, Trip, TripDay } from '../../domain/types'
import { selectTodaySummary } from './todaySummary'

const trip: Trip = { id: 'trip-1', title: '首爾小旅行', destination: '首爾', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 10000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true }
const day: TripDay = { id: 'day-1', tripId: 'trip-1', date: '2026-08-25', city: '首爾', title: 'Day 1 抵達', summary: '抵達與散步', accommodation: '韓屋', illustrationId: 'hanbok-woman' }
const activities: Activity[] = [
  { id: 'activity-2', tripId: 'trip-1', dayId: 'day-1', date: '2026-08-25', time: '15:00', type: 'food', title: '晚餐', locationName: '弘大', address: '', googleMapsUrl: '', notes: '', order: 1, illustrationId: 'food' },
  { id: 'activity-1', tripId: 'trip-1', dayId: 'day-1', date: '2026-08-25', time: '10:00', type: 'spot', title: '景福宮', locationName: '景福宮', address: '', googleMapsUrl: '', notes: '', order: 0, illustrationId: 'gyeongbokgung-palace' },
]
const expenses: Expense[] = [{ id: 'expense-1', tripId: 'trip-1', date: '2026-08-25', amountMinor: 1000, currency: 'TWD', exchangeRateToBase: 1, baseAmountMinor: 2400, category: '美食', payerId: 'member-1', splitMode: 'equal', notes: '' }]

describe('todaySummary selector', () => {
  it('依日期與時間排序活動，並找出下一個活動與剩餘預算', () => {
    const summary = selectTodaySummary({ trip, days: [day], activities, expenses, referenceDate: '2026-08-25', referenceTime: '10:30' })

    expect(summary.day).toEqual(day)
    expect(summary.activities.map((activity) => activity.id)).toEqual(['activity-1', 'activity-2'])
    expect(summary.nextActivity?.id).toBe('activity-2')
    expect(summary.activityCount).toBe(2)
    expect(summary.spentMinor).toBe(2400)
    expect(summary.remainingBudgetMinor).toBe(7600)
  })

  it('沒有當日資料時選擇下一個行程日，且不讓剩餘預算低於零', () => {
    const laterDay = { ...day, id: 'day-2', date: '2026-08-27' }
    const summary = selectTodaySummary({ trip: { ...trip, budgetMinor: 100 }, days: [day, laterDay], activities: [], expenses: [{ ...expenses[0], baseAmountMinor: 2400 }], referenceDate: '2026-08-26' })

    expect(summary.date).toBe('2026-08-27')
    expect(summary.day?.id).toBe('day-2')
    expect(summary.remainingBudgetMinor).toBe(0)
  })
})
