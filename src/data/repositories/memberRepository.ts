import type { Member } from '../../domain/types'
import { db, type TravelDatabase } from '../db'

export class MemberRepository {
  private readonly database: TravelDatabase

  constructor(database: TravelDatabase = db) {
    this.database = database
  }

  async listByTrip(tripId: string): Promise<Member[]> {
    return this.database.members.where('tripId').equals(tripId).toArray()
  }

  async save(member: Member): Promise<void> {
    await this.database.transaction('rw', this.database.members, this.database.photos, async () => {
      const previous = await this.database.members.get(member.id)
      await this.database.members.put(member)
      if (previous?.photoId && previous.photoId !== member.photoId) await this.database.photos.delete(previous.photoId)
      if (previous?.lineQrPhotoId && previous.lineQrPhotoId !== member.lineQrPhotoId) await this.database.photos.delete(previous.lineQrPhotoId)
    })
  }

  async delete(member: Member): Promise<void> {
    await this.database.transaction('rw', this.database.members, this.database.photos, async () => {
      await this.database.members.delete(member.id)
      if (member.photoId) await this.database.photos.delete(member.photoId)
      if (member.lineQrPhotoId) await this.database.photos.delete(member.lineQrPhotoId)
    })
  }
}
