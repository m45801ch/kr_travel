import { useEffect, useState } from 'react'
import { Camera, Copy, ExternalLink, Mail, MapPin, MessageCircle, Phone, QrCode, StickyNote, UserRound } from 'lucide-react'
import type { Member } from '../../domain/types'
import { getIllustration } from '../../assets/illustrations'
import { buildGoogleMapsSearchUrl } from '../../integrations/maps/googleMapsUrl'
import { getPhoto } from '../lists/photoStore'

function buildLineUrl(lineId: string, lineAddUrl?: string): string {
  const trimmed = lineId.trim()
  if (lineAddUrl?.trim()) return lineAddUrl.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('@')) return `https://line.me/R/ti/p/${encodeURIComponent(trimmed)}`
  return 'https://line.me/R/nv/addFriends'
}

type CompanionCardProps = {
  member: Member
  onEdit: (member: Member) => void
}

export function CompanionCard({ member, onEdit }: CompanionCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string>()
  const [lineQrUrl, setLineQrUrl] = useState<string>()
  const [copied, setCopied] = useState(false)
  const illustration = getIllustration(member.illustrationId)

  useEffect(() => {
    let nextUrl: string | undefined
    let nextQrUrl: string | undefined
    let cancelled = false

    if (member.photoId) {
      void getPhoto(member.photoId).then((blob) => {
        if (!blob || cancelled) return
        nextUrl = URL.createObjectURL(blob)
        setPhotoUrl(nextUrl)
      })
    }
    if (member.lineQrPhotoId) {
      void getPhoto(member.lineQrPhotoId).then((blob) => {
        if (!blob || cancelled) return
        nextQrUrl = URL.createObjectURL(blob)
        setLineQrUrl(nextQrUrl)
      })
    }

    return () => {
      cancelled = true
      if (nextUrl) URL.revokeObjectURL(nextUrl)
      if (nextQrUrl) URL.revokeObjectURL(nextQrUrl)
    }
  }, [member.lineQrPhotoId, member.photoId])

  const hasContact = Boolean(member.phone || member.email || member.lineId || member.lineQrPhotoId || member.address || member.notes)
  const copyLineId = async () => {
    if (!member.lineId) return
    try { await navigator.clipboard.writeText(member.lineId); setCopied(true); window.setTimeout(() => setCopied(false), 1600) } catch { setCopied(false) }
  }

  return (
    <article className="companion-card">
      <button className="companion-card-main" type="button" onClick={() => onEdit(member)} aria-label={`編輯${member.name}`}>
        <div className="companion-card-avatar" style={{ '--companion-accent': member.color } as React.CSSProperties}>
          {photoUrl ? <img src={photoUrl} alt={`${member.name}的旅伴圖片`} /> : illustration.imageUrl ? <img src={illustration.imageUrl} alt={`${member.name}的預設圖案`} /> : <span>{illustration.emoji}</span>}
        </div>
        <div className="companion-card-info">
          <span className="companion-card-label"><UserRound size={14} aria-hidden="true" /> TRAVEL COMPANION</span>
          <h2>{member.name}</h2>
          <p>{photoUrl ? '已設定旅伴圖片' : illustration.label}</p>
        </div>
        {member.photoId && <span className="companion-photo-badge" title="已上傳圖片"><Camera size={16} aria-hidden="true" /></span>}
      </button>
      {hasContact && (
        <div className="companion-contacts">
          {member.phone && <a className="companion-contact" href={`tel:${member.phone.replace(/[^+\d]/g, '')}`} aria-label={`撥打電話給 ${member.name}`}><Phone size={12} aria-hidden="true" />{member.phone}</a>}
          {member.email && <a className="companion-contact" href={`mailto:${member.email.trim()}`} aria-label={`寄信給 ${member.name}`}><Mail size={12} aria-hidden="true" />{member.email}</a>}
          {member.lineId && <><a className="companion-contact line-open-contact" href={buildLineUrl(member.lineId, member.lineAddUrl)} target="_blank" rel="noopener noreferrer" aria-label={`開啟 ${member.name} 的 LINE`}><ExternalLink size={12} aria-hidden="true" />{member.lineAddUrl ? '開啟加好友頁' : '開啟 LINE'}</a><button className="companion-contact line-copy-contact" type="button" onClick={() => void copyLineId()} aria-label={`複製 ${member.name} 的 LINE ID`}><Copy size={12} aria-hidden="true" />{copied ? '已複製' : '複製 ID'}</button><span className="companion-contact"><MessageCircle size={12} aria-hidden="true" />{member.lineAddUrl ? 'LINE 加好友碼：' : ''}{member.lineId}</span></>}
          {lineQrUrl && <details className="line-qr-contact"><summary className="companion-contact"><QrCode size={12} aria-hidden="true" />顯示 QR Code</summary><img src={lineQrUrl} alt={`${member.name} 的 LINE 加好友 QR Code`} /></details>}
          {member.address && <a className="companion-contact" href={buildGoogleMapsSearchUrl(member.address)} target="_blank" rel="noopener noreferrer" aria-label={`在 Google 地圖開啟 ${member.address}`}><MapPin size={12} aria-hidden="true" />{member.address}</a>}
          {member.notes && !member.phone && !member.email && !member.lineId && !member.address && <span className="companion-contact"><StickyNote size={12} aria-hidden="true" />{member.notes}</span>}
          {member.notes && (member.phone || member.email || member.lineId || member.address) && <span className="companion-contact notes"><StickyNote size={12} aria-hidden="true" />{member.notes}</span>}
        </div>
      )}
    </article>
  )
}
