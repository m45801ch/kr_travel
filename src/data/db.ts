import Dexie, { type Table } from 'dexie'
import type {
  Activity,
  Expense,
  ExpenseSplit,
  ListItem,
  Member,
  Settings,
  Trip,
  TripDay,
  WeatherCache,
} from '../domain/types'

export class TravelDatabase extends Dexie {
  trips!: Table<Trip, string>
  days!: Table<TripDay, string>
  activities!: Table<Activity, string>
  members!: Table<Member, string>
  expenses!: Table<Expense, string>
  expenseSplits!: Table<ExpenseSplit, string>
  listItems!: Table<ListItem, string>
  weatherCache!: Table<WeatherCache, string>
  settings!: Table<Settings, string>
  photos!: Table<{ id: string; blob: Blob }, string>

  constructor(name = 'korea-travel') {
    super(name)
    this.version(1).stores({
      trips: 'id, active, startDate',
      days: 'id, tripId, date',
      activities: 'id, tripId, dayId, date, order',
      members: 'id, tripId',
      expenses: 'id, tripId, date',
      expenseSplits: 'id, expenseId, tripId, memberId',
      listItems: 'id, [tripId+type], tripId, type, completed, order',
      weatherCache: 'id, tripId, date, locationKey',
      settings: 'id',
    })
    this.version(2).stores({ photos: 'id' })
  }
}

export const db = new TravelDatabase()
