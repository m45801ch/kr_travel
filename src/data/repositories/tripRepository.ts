import { db, type TravelDatabase } from '../db'
import type { Activity, Trip, TripDay } from '../../domain/types'

export class TripRepository {
  private readonly database: TravelDatabase

  constructor(database: TravelDatabase = db) {
    this.database = database
  }

  async getActiveTrip(): Promise<Trip | undefined> {
    const trips = await this.database.trips.toArray()
    return trips.find((trip) => trip.active)
  }

  async saveTrip(trip: Trip): Promise<void> {
    await this.database.trips.put(trip)
  }

  async listDays(tripId: string): Promise<TripDay[]> {
    return this.database.days.where('tripId').equals(tripId).sortBy('date')
  }

  async saveDay(day: TripDay): Promise<void> {
    await this.database.days.put(day)
  }

  async deleteDay(id: string): Promise<void> {
    await this.database.days.delete(id)
  }

  async listActivities(dayId: string): Promise<Activity[]> {
    const activities = await this.database.activities.where('dayId').equals(dayId).toArray()
    return activities.sort((a, b) => a.order - b.order || a.time.localeCompare(b.time))
  }

  async saveActivity(activity: Activity): Promise<void> {
    await this.database.activities.put(activity)
  }

  async deleteActivity(id: string): Promise<void> {
    await this.database.activities.delete(id)
  }

  async deleteActivitiesByDay(dayId: string): Promise<void> {
    await this.database.activities.where('dayId').equals(dayId).delete()
  }
}
