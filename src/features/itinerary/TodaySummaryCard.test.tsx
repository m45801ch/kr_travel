import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TodaySummary } from './todaySummary'
import { TodaySummaryCard } from './TodaySummaryCard'

const summary: TodaySummary = {
  date: '2026-08-25',
  day: {
    id: 'day-1',
    tripId: 'trip-1',
    date: '2026-08-25',
    city: '首爾',
    weatherLocation: '東京',
    title: 'Day 1 抵達',
    summary: '抵達與散步',
    accommodation: '韓屋',
    illustrationId: 'hanbok-woman',
  },
  activities: [],
  nextActivity: {
    id: 'activity-1',
    tripId: 'trip-1',
    dayId: 'day-1',
    date: '2026-08-25',
    time: '10:00',
    type: 'spot',
    title: '景福宮',
    locationName: '景福宮',
    address: '',
    googleMapsUrl: '',
    notes: '',
    order: 0,
    illustrationId: 'gyeongbokgung-palace',
  },
  activityCount: 3,
  spentMinor: 125000,
  remainingBudgetMinor: 500000,
  weather: {
    date: '2026-08-25',
    temperatureMax: 27,
    temperatureMin: 18,
    weatherCode: 1,
    description: '晴朗',
    locationName: 'Tokyo',
  },
}

describe('TodaySummaryCard', () => {
  it('renders the next activity, weather, activity count, and remaining budget', () => {
    render(<TodaySummaryCard summary={summary} currency="TWD" />)

    expect(screen.getByText('TODAY AT A GLANCE')).toBeInTheDocument()
    expect(screen.getByText('Day 1 抵達')).toBeInTheDocument()
    expect(screen.getByText('2026-08-25 · 東京')).toBeInTheDocument()
    expect(screen.getByText('景福宮')).toBeInTheDocument()
    expect(screen.getByText('10:00 · 景福宮')).toBeInTheDocument()
    expect(screen.getByText('晴朗 27° / 18°')).toBeInTheDocument()
    expect(screen.getByText('3 個')).toBeInTheDocument()
    expect(screen.getByText(/500,000/)).toBeInTheDocument()
  })
})
