import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Camera, ImagePlus, QrCode } from 'lucide-react'
import type { Member } from '../../domain/types'
import { IllustrationPicker } from '../../components/IllustrationPicker'
import { compressPhoto, getPhoto, savePhoto } from '../lists/photoStore'
import { getIllustration } from '../../assets/illustrations'

const memberColors = ['#ef8490', '#8ba9d6', '#78bda7', '#b19bd4', '#f4c768']

type CompanionFormProps = {
  tripId: string
  member?: Member
  onSave: (member: Member) => void | Promise<void>
  onDelete?: (member: Member) => void
  onCancel: () => void
}

function useStoredPhotoUrl(photoId?: string) {
  const [photoUrl, setPhotoUrl] = useState<string>()

  useEffect(() => {
    let objectUrl: string | undefined
    let cancelled = false

    if (photoId) {
      void getPhoto(photoId).then((blob) => {
        if (!blob || cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPhotoUrl(objectUrl)
      })
    }

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoId])

  return photoUrl
}

type DetectedBarcode = { rawValue?: string }
type BarcodeDetectorLike = { detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]> }
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike

type LineQrResult = { value: string; addUrl?: string }

function parseLineQrValue(value: string): LineQrResult {
  const trimmed = value.trim()
  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname === 'line.me') {
      const encodedId = parsed.pathname.split('/').filter(Boolean).pop()
      if (encodedId) return { value: decodeURIComponent(encodedId), addUrl: trimmed }
    }
    if (parsed.protocol === 'line:' && parsed.pathname) return { value: decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() ?? trimmed), addUrl: trimmed }
  } catch { return { value: trimmed } }
  return { value: trimmed }
}

export function CompanionForm({ tripId, member, onSave, onDelete, onCancel }: CompanionFormProps) {
  const [name, setName] = useState(member?.name ?? '')
  const [phone, setPhone] = useState(member?.phone ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [lineId, setLineId] = useState(member?.lineId ?? '')
  const [lineAddUrl, setLineAddUrl] = useState(member?.lineAddUrl ?? '')
  const [lineScanNotice, setLineScanNotice] = useState('')
  const [lineQrPhoto, setLineQrPhoto] = useState<File>()
  const [removeLineQrPhoto, setRemoveLineQrPhoto] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const scannerVideoRef = useRef<HTMLVideoElement>(null)
  const [address, setAddress] = useState(member?.address ?? '')
  const [notes, setNotes] = useState(member?.notes ?? '')
  const [illustrationId, setIllustrationId] = useState<Member['illustrationId']>(member?.illustrationId ?? 'companion-girl')
  const [photo, setPhoto] = useState<File>()
  const [removePhoto, setRemovePhoto] = useState(false)
  const photoPreviewUrl = useMemo(() => photo ? URL.createObjectURL(photo) : undefined, [photo])
  const storedPhotoUrl = useStoredPhotoUrl(member?.photoId)
  const storedLineQrUrl = useStoredPhotoUrl(member?.lineQrPhotoId)
  const lineQrPreviewUrl = useMemo(() => lineQrPhoto ? URL.createObjectURL(lineQrPhoto) : undefined, [lineQrPhoto])
  const fallbackIllustration = getIllustration(illustrationId)
  const displayedPhotoUrl = removePhoto ? undefined : (photoPreviewUrl ?? storedPhotoUrl)
  const displayedLineQrUrl = removeLineQrPhoto ? undefined : (lineQrPreviewUrl ?? storedLineQrUrl)
  const isEditing = Boolean(member)

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
      if (lineQrPreviewUrl) URL.revokeObjectURL(lineQrPreviewUrl)
    }
  }, [lineQrPreviewUrl, photoPreviewUrl])

  useEffect(() => {
    if (!scannerOpen) return
    let active = true
    let stream: MediaStream | undefined
    let animationFrame = 0
    const stop = () => {
      active = false
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      stream?.getTracks().forEach((track) => track.stop())
      if (scannerVideoRef.current) scannerVideoRef.current.srcObject = null
    }
    const scan = async () => {
      const detector = new ((window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector ?? class { detect = async () => [] })({ formats: ['qr_code'] })
      if (!scannerVideoRef.current || !active) return
      try {
        const results = await detector.detect(scannerVideoRef.current)
        const value = results[0]?.rawValue
        if (value) {
          const parsed = parseLineQrValue(value)
          setLineId('')
          setLineAddUrl(parsed.addUrl ?? '')
          setLineScanNotice(parsed.addUrl ? '已取得 LINE 加好友連結；QR Code 無法轉換成可搜尋的 LINE ID，ID 請另外手動輸入。' : '掃描內容不是 LINE 加好友連結，請手動確認內容。')
          setScannerOpen(false)
          return
        }
      } catch { setScannerError('無法辨識 QR Code，請調整距離與光線。') }
      if (active) animationFrame = window.requestAnimationFrame(() => void scan())
    }
    const start = async () => {
      const Detector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
      if (!Detector) {
        setScannerError('此瀏覽器不支援相機 QR Code 掃描，請改用上傳圖片。')
        return
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError('目前環境無法使用相機，請改用上傳圖片。')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (!active || !scannerVideoRef.current) return
        scannerVideoRef.current.srcObject = stream
        await scannerVideoRef.current.play()
        void scan()
      } catch {
        setScannerError('無法開啟相機，請確認已允許相機權限，或改用上傳圖片。')
      }
    }
    void start()
    return stop
  }, [scannerOpen])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return

    const id = member?.id ?? crypto.randomUUID()
    const photoId = photo ? `${id}-photo-${Date.now()}` : (removePhoto ? undefined : member?.photoId)
    const lineQrPhotoId = lineQrPhoto ? `${id}-line-qr-${Date.now()}` : (removeLineQrPhoto ? undefined : member?.lineQrPhotoId)
    if (photo && photoId) await savePhoto(photoId, await compressPhoto(photo))
    if (lineQrPhoto && lineQrPhotoId) await savePhoto(lineQrPhotoId, await compressPhoto(lineQrPhoto, 1200))

    const nextMember: Member = {
      id,
      tripId,
      name: name.trim(),
      color: member?.color ?? memberColors[Date.now() % memberColors.length],
      illustrationId,
      notes: notes.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      lineId: lineId.trim() || undefined,
      lineAddUrl: lineAddUrl.trim() || undefined,
      lineQrPhotoId,
      address: address.trim() || undefined,
    }
    if (photoId) nextMember.photoId = photoId

    await onSave(nextMember)
  }

  return (
    <div className="modal-backdrop">
      <form className="activity-form companion-form" onSubmit={(event) => void submit(event)}>
        <div className="form-heading">
          <div>
            <p className="eyebrow">{isEditing ? 'EDIT TRAVEL COMPANION' : 'NEW TRAVEL COMPANION'}</p>
            <h2>{isEditing ? '編輯旅伴' : '新增旅伴'}</h2>
          </div>
          <button type="button" onClick={onCancel} aria-label="關閉">×</button>
        </div>

        <label>
          旅伴名稱
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：小美" autoFocus />
        </label>

        <div className="companion-photo-preview">
          <div className="companion-preview-avatar">
            {displayedPhotoUrl ? <img src={displayedPhotoUrl} alt="旅伴圖片預覽" /> : <span>{fallbackIllustration.emoji}</span>}
          </div>
          <div>
            <strong>{photo ? photo.name : (storedPhotoUrl && !removePhoto ? '目前旅伴圖片' : '尚未選擇照片')}</strong>
            <span>{photo ? '儲存後會以新圖片取代目前圖片' : '也可以使用下方的預設頭像'}</span>
          </div>
        </div>

        <label className="companion-upload">
          <ImagePlus size={20} aria-hidden="true" />
          <span>{isEditing ? '更換旅伴圖片' : '上傳旅伴圖片'} <small>（選填）</small></span>
          <input type="file" accept="image/*" onChange={(event) => { setPhoto(event.target.files?.[0]); setRemovePhoto(false) }} />
        </label>

        {isEditing && (member?.photoId || photo) && !removePhoto && (
          <button className="companion-clear-photo-button" type="button" onClick={() => { setPhoto(undefined); setRemovePhoto(true) }}>
            移除目前圖片
          </button>
        )}

        <div className="form-grid">
          <label>電話<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="例如：0912-345-678" /></label>
          <label>LINE ID（手動輸入）<input value={lineId} onChange={(event) => setLineId(event.target.value)} placeholder="例如：line_id123 或 @官方帳號" /></label>
        </div>
        <div className="line-friend-tools">
          <div className="line-friend-heading"><QrCode size={18} aria-hidden="true" /><strong>LINE 加好友 QR Code</strong><small>選填，可上傳 LINE 裡的 QR Code</small></div>
          <button className="line-scan-button" type="button" onClick={() => { setScannerError(''); setScannerOpen(true) }}><Camera size={17} aria-hidden="true" />開啟相機掃描</button>
          {scannerOpen && <div className="line-scanner" role="dialog" aria-label="掃描 LINE QR Code"><video ref={scannerVideoRef} className="line-scanner-video" playsInline muted /><p>{scannerError || '請將 LINE QR Code 對準框線內'}</p><button className="button-secondary compact" type="button" onClick={() => setScannerOpen(false)}>關閉相機</button></div>}
          {lineScanNotice && <p className="line-scan-notice" role="status">{lineScanNotice}</p>}
          {displayedLineQrUrl && <img className="line-qr-preview" src={displayedLineQrUrl} alt="LINE 加好友 QR Code 預覽" />}
          <label className="companion-upload line-qr-upload">
            <QrCode size={20} aria-hidden="true" />
            <span>{isEditing ? '更換 LINE QR Code' : '上傳 LINE QR Code'} <small>（選填）</small></span>
            <input type="file" accept="image/*" onChange={(event) => { setLineQrPhoto(event.target.files?.[0]); setRemoveLineQrPhoto(false) }} />
          </label>
          {isEditing && (member?.lineQrPhotoId || lineQrPhoto) && !removeLineQrPhoto && <button className="companion-clear-photo-button" type="button" onClick={() => { setLineQrPhoto(undefined); setRemoveLineQrPhoto(true) }}>移除 LINE QR Code</button>}
        </div>
        <div className="form-grid">
          <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="例如：test@example.com" /></label>
          <label>地址<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="例如：台北市信義區..." /></label>
        </div>
        <label>備註<textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="緊急聯絡資訊或其他備註" /></label>

        <label>
          預設頭像
          <IllustrationPicker value={illustrationId} onChange={(value) => setIllustrationId(value as Member['illustrationId'])} />
        </label>

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onCancel}>取消</button>
          <button type="submit" className="button-primary">{isEditing ? '儲存變更' : '儲存旅伴'}</button>
        </div>
        {isEditing && member && onDelete && (
          <button type="button" className="button-danger delete-expense-button" onClick={() => { if (window.confirm(`確定要刪除「${member.name}」嗎？刪除後無法復原。`)) onDelete(member) }}>
            刪除此旅伴
          </button>
        )}
      </form>
    </div>
  )
}
