import type { Member } from '../../domain/types'
import { db, type TravelDatabase } from '../db'

export const SELF_MEMBER_ID = 'member-me'

export function isSelfMember(member: Member): boolean {
  return member.id === SELF_MEMBER_ID || member.id === 'self' || member.name === '我'
}

export function createSelfMember(tripId: string, legacyMember?: Member): Member {
  return {
    id: legacyMember?.id ?? SELF_MEMBER_ID,
    tripId,
    name: '我',
    color: legacyMember?.color ?? '#ef8490',
    illustrationId: legacyMember?.illustrationId ?? 'hanbok-woman',
    notes: '',
  }
}

export class MemberRepository {
  private readonly database: TravelDatabase

  constructor(database: TravelDatabase = db) {
    this.database = database
  }

  async listByTrip(tripId: string): Promise<Member[]> {
    return this.database.members.where('tripId').equals(tripId).toArray()
  }

  async listCompanionsByTrip(tripId: string): Promise<Member[]> {
    return (await this.listByTrip(tripId)).filter((member) => !isSelfMember(member))
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
