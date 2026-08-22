import { useEffect, useState } from 'react'
import { Camera, UserRound } from 'lucide-react'
import type { Member } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'
import { getPhoto } from '../lists/photoStore'

type CompanionCardProps = {
  member: Member
  onEdit: (member: Member) => void
}

export function CompanionCard({ member, onEdit }: CompanionCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string>()
  const illustration = getIllustration(member.illustrationId)

  useEffect(() => {
    let nextUrl: string | undefined
    let cancelled = false

    if (member.photoId) {
      void getPhoto(member.photoId).then((blob) => {
        if (!blob || cancelled) return
        nextUrl = URL.createObjectURL(blob)
        setPhotoUrl(nextUrl)
      })
    }

    return () => {
      cancelled = true
      if (nextUrl) URL.revokeObjectURL(nextUrl)
    }
  }, [member.photoId])

  return (
    <article className="companion-card">
      <button className="companion-card-main" type="button" onClick={() => onEdit(member)} aria-label={`編輯${member.name}`}>
        <div className="companion-card-avatar" style={{ '--companion-accent': member.color } as React.CSSProperties}>
          {photoUrl ? <img src={photoUrl} alt={`${member.name}的旅伴圖片`} /> : <span>{illustration.emoji}</span>}
        </div>
        <div className="companion-card-info">
          <span className="companion-card-label"><UserRound size={14} aria-hidden="true" /> TRAVEL COMPANION</span>
          <h2>{member.name}</h2>
          <p>{photoUrl ? '已設定旅伴圖片' : illustration.label}</p>
        </div>
        {member.photoId && <span className="companion-photo-badge" title="已上傳圖片"><Camera size={16} aria-hidden="true" /></span>}
      </button>
    </article>
  )
}
