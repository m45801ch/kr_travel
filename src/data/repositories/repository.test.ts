import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { TravelDatabase } from '../db'
import { ExpenseRepository } from './expenseRepository'
import { ListRepository } from './listRepository'
import { TripRepository } from './tripRepository'
import type { Expense, ListItem, Trip, TripDay } from '../../domain/types'

const testDb = new TravelDatabase(`test-${Date.now()}`)
const tripRepository = new TripRepository(testDb)
const expenseRepository = new ExpenseRepository(testDb)
const listRepository = new ListRepository(testDb)

afterEach(async () => {
  await Promise.all(testDb.tables.map((table) => table.clear()))
})

describe('repositories', () => {
  it('stores and reads the active trip', async () => {
    const trip: Trip = {
      id: 'trip-1', title: '首爾之旅', destination: '首爾', startDate: '2026-10-01', endDate: '2026-10-05',
      baseCurrency: 'TWD', budgetMinor: 5000000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true,
    }
    await tripRepository.saveTrip(trip)
    expect(await tripRepository.getActiveTrip()).toEqual(trip)
  })

  it('removes an itinerary day so stale date cards cannot be listed', async () => {
    const days: TripDay[] = [
      { id: 'trip-1-day-1', tripId: 'trip-1', date: '2026-10-01', city: '首爾', title: 'Day 1', summary: '', accommodation: '', illustrationId: 'hanbok-woman' },
      { id: 'trip-1-day-2', tripId: 'trip-1', date: '2026-10-02', city: '首爾', title: 'Day 2', summary: '', accommodation: '', illustrationId: 'korean-house' },
    ]
    await Promise.all(days.map((day) => tripRepository.saveDay(day)))
    await tripRepository.deleteDay(days[1].id)
    expect(await tripRepository.listDays('trip-1')).toEqual([days[0]])
  })

  it('scopes expenses by trip id', async () => {
    const expense: Expense = {
      id: 'expense-1', tripId: 'trip-1', date: '2026-10-01', amountMinor: 1000, currency: 'TWD',
      exchangeRateToBase: 1, baseAmountMinor: 1000, category: 'food', payerId: 'member-1', splitMode: 'equal', notes: '',
    }
    await expenseRepository.save(expense, [])
    expect(await expenseRepository.listByTrip('trip-2')).toEqual([])
    expect(await expenseRepository.listByTrip('trip-1')).toEqual([expense])
  })

  it('separates shopping and prep items by type', async () => {
    const items: ListItem[] = [
      { id: 'shopping-1', tripId: 'trip-1', type: 'shopping', name: '保暖衣', category: '衣物', note: '', priority: 'normal', location: '', illustrationId: 'shopping-bag', completed: false, order: 0 },
      { id: 'prep-1', tripId: 'trip-1', type: 'prep', name: '護照', category: '證件', note: '', priority: 'important', location: '', illustrationId: 'airport-travel', completed: false, order: 0 },
    ]
    await Promise.all(items.map((item) => listRepository.save(item)))
    expect((await listRepository.listByTrip('trip-1', 'shopping')).map((item) => item.id)).toEqual(['shopping-1'])
    expect((await listRepository.listByTrip('trip-1', 'prep')).map((item) => item.id)).toEqual(['prep-1'])
  })
})
