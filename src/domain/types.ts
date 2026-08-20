export type Currency = 'TWD' | 'KRW' | 'JPY' | 'USD' | 'HKD'
export type ListType = 'shopping' | 'prep'
export type SplitMode = 'equal' | 'custom'
export type ActivityType = 'spot' | 'food' | 'transit' | 'stay' | 'other'
export type IllustrationId = string

export interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  baseCurrency: Currency
  budgetMinor: number
  illustrationId: IllustrationId
  themeColor: string
  active: boolean
}

export interface TripDay {
  id: string
  tripId: string
  date: string
  city: string
  title: string
  summary: string
  accommodation: string
  illustrationId: IllustrationId
}

export interface Activity {
  id: string
  tripId: string
  dayId: string
  date: string
  time: string
  type: ActivityType
  title: string
  locationName: string
  address: string
  googleMapsUrl: string
  notes: string
  reminderMinutes?: number
  order: number
  illustrationId: IllustrationId
}

export interface Member {
  id: string
  tripId: string
  name: string
  color: string
  illustrationId: IllustrationId
  notes: string
}

export interface Expense {
  id: string
  tripId: string
  date: string
  amountMinor: number
  currency: Currency
  exchangeRateToBase: number
  baseAmountMinor: number
  category: string
  payerId: string
  splitMode: SplitMode
  notes: string
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  tripId: string
  memberId: string
  amountMinor: number
  percentage: number
  settled: boolean
}

export interface ListItem {
  id: string
  tripId: string
  type: ListType
  name: string
  category: string
  photoId?: string
  note: string
  priority: 'normal' | 'important'
  location: string
  dueDate?: string
  assigneeId?: string
  illustrationId: IllustrationId
  completed: boolean
  order: number
}

export interface WeatherSnapshot {
  date: string
  temperatureMax: number
  temperatureMin: number
  weatherCode: number
  description: string
  locationName: string
  feelsLike?: number
}

export interface WeatherCache {
  id: string
  tripId: string
  date: string
  locationKey: string
  snapshot: WeatherSnapshot
  updatedAt: string
}

export interface Settings {
  id: 'global'
  activeTripId?: string
  themeColor: string
  fontScale: number
  darkMode: boolean
  effects: boolean
  defaultCurrency: Currency
}
