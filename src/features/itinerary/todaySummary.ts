import type { Activity, Expense, Trip, TripDay, WeatherSnapshot } from '../../domain/types'

export interface TodaySummaryInput {
  trip: Trip
  days: TripDay[]
  activities: Activity[]
  expenses: Expense[]
  referenceDate?: string
  referenceTime?: string
  weather?: WeatherSnapshot & { isStale?: boolean; updatedAt?: string }
}

export interface TodaySummary {
  date: string
  day?: TripDay
  activities: Activity[]
  nextActivity?: Activity
  activityCount: number
  spentMinor: number
  remainingBudgetMinor: number
  weather?: WeatherSnapshot & { isStale?: boolean; updatedAt?: string }
}

function toIsoDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function compareActivities(a: Activity, b: Activity): number {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.order - b.order
}

function pickSummaryDay(trip: Trip, days: TripDay[], referenceDate: string): TripDay | undefined {
  const ordered = days.filter((day) => day.tripId === trip.id).sort((a, b) => a.date.localeCompare(b.date))
  if (!ordered.length) return undefined
  const inTrip = ordered.find((day) => day.date === referenceDate)
  if (inTrip) return inTrip
  const upcoming = ordered.find((day) => day.date > referenceDate)
  return upcoming ?? ordered[ordered.length - 1]
}

export function selectTodaySummary(input: TodaySummaryInput): TodaySummary {
  const referenceDate = input.referenceDate ?? toIsoDate()
  const day = pickSummaryDay(input.trip, input.days, referenceDate)
  const date = day?.date ?? referenceDate
  const activities = input.activities
    .filter((activity) => activity.tripId === input.trip.id && activity.dayId === day?.id && activity.date === date)
    .sort(compareActivities)
  const referenceTime = input.referenceTime ?? new Date().toTimeString().slice(0, 5)
  const nextActivity = activities.find((activity) => date !== referenceDate || activity.time >= referenceTime)
  const spentMinor = input.expenses
    .filter((expense) => expense.tripId === input.trip.id)
    .reduce((sum, expense) => sum + expense.baseAmountMinor, 0)

  return {
    date,
    day,
    activities,
    nextActivity,
    activityCount: activities.length,
    spentMinor,
    remainingBudgetMinor: Math.max(0, input.trip.budgetMinor - spentMinor),
    weather: input.weather,
  }
}
