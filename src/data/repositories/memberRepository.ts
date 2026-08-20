import { db, type TravelDatabase } from '../db'
import type { Member } from '../../domain/types'

export class MemberRepository {
  private readonly database: TravelDatabase

  constructor(database: TravelDatabase = db) {
    this.database = database
  }

  async listByTrip(tripId: string): Promise<Member[]> {
    return this.database.members.where('tripId').equals(tripId).toArray()
  }

  async save(member: Member): Promise<void> {
    await this.database.members.put(member)
  }
}
