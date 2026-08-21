import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TripDay } from '../../domain/types'
import { DateStrip } from './DateStrip'

const day: TripDay = {
  id: 'trip-1-day-1',
  tripId: 'trip-1',
  date: '2027-01-25',
  city: '首爾',
  weatherLocation: '明洞',
  title: 'Day 1',
  summary: '',
  accommodation: '',
  illustrationId: 'hanbok-woman',
}

describe('DateStrip', () => {
  it('shows the saved weather location instead of the fallback city', () => {
    render(<DateStrip days={[day]} selectedDate={day.date} onSelect={vi.fn()} />)

    expect(screen.getByText('明洞')).toBeInTheDocument()
    expect(screen.queryByText('首爾')).not.toBeInTheDocument()
  })
})
