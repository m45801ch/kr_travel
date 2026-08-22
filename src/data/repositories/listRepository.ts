import { db, type TravelDatabase } from '../db'
import type { ListItem, ListType } from '../../domain/types'

export class ListRepository {
  private readonly database: TravelDatabase

  constructor(database: TravelDatabase = db) {
    this.database = database
  }

  async listByTrip(tripId: string, type: ListType): Promise<ListItem[]> {
    const items = await this.database.listItems.where('[tripId+type]').equals([tripId, type]).toArray()
    return items.sort((a, b) => a.order - b.order)
  }

  async save(item: ListItem): Promise<void> {
    await this.database.listItems.put(item)
  }

  async delete(id: string): Promise<void> {
    await this.database.listItems.delete(id)
  }
}
