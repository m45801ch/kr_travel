import { useEffect, useMemo, useState } from 'react'

const VIEWPORT_SIZE = 280
const OUTPUT_SIZE = 512

type CropImage = { element: HTMLImageElement; width: number; height: number }

function clampOffset(value: number, renderedSize: number): number {
  const limit = Math.max(0, (renderedSize - VIEWPORT_SIZE) / 2)
  return Math.min(limit, Math.max(-limit, value))
}

export function SquarePhotoCropper({ file, onConfirm, onCancel }: {
  file: File
  onConfirm: (file: File) => void
  onCancel: () => void
}) {
  const [image, setImage] = useState<CropImage>()
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{ pointerX: number; pointerY: number; x: number; y: number }>()
  const [error, setError] = useState('')
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file])

  useEffect(() => {
    const nextImage = new Image()
    nextImage.onload = () => setImage({ element: nextImage, width: nextImage.naturalWidth, height: nextImage.naturalHeight })
    nextImage.onerror = () => setError('無法讀取這張圖片，請重新選擇。')
    nextImage.src = previewUrl
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const baseScale = image ? Math.max(VIEWPORT_SIZE / image.width, VIEWPORT_SIZE / image.height) : 1
  const renderedWidth = image ? image.width * baseScale * zoom : VIEWPORT_SIZE
  const renderedHeight = image ? image.height * baseScale * zoom : VIEWPORT_SIZE

  const startDragging = (event: React.PointerEvent<HTMLImageElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragStart({ pointerX: event.clientX, pointerY: event.clientY, x: offset.x, y: offset.y })
  }
  const drag = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragStart) return
    setOffset({
      x: clampOffset(dragStart.x + event.clientX - dragStart.pointerX, renderedWidth),
      y: clampOffset(dragStart.y + event.clientY - dragStart.pointerY, renderedHeight),
    })
  }
  const changeZoom = (nextZoom: number) => {
    setZoom(nextZoom)
    setOffset({
      x: clampOffset(offset.x, image ? image.width * baseScale * nextZoom : VIEWPORT_SIZE),
      y: clampOffset(offset.y, image ? image.height * baseScale * nextZoom : VIEWPORT_SIZE),
    })
  }
  const confirm = () => {
    if (!image) return
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(image.element, (VIEWPORT_SIZE - renderedWidth) / 2 + offset.x, (VIEWPORT_SIZE - renderedHeight) / 2 + offset.y, renderedWidth, renderedHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('裁切圖片失敗，請重新嘗試。')
        return
      }
      onConfirm(new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-avatar.webp`, { type: 'image/webp' }))
    }, 'image/webp', .88)
  }

  return (
    <div className="photo-crop-backdrop">
      <section className="photo-crop-dialog" role="dialog" aria-modal="true" aria-label="調整旅伴大頭貼">
        <div className="photo-crop-heading"><div><p className="eyebrow">CROP AVATAR</p><h2>調整大頭貼</h2></div><button type="button" className="photo-crop-close" onClick={onCancel} aria-label="取消裁切">×</button></div>
        <p className="photo-crop-help">拖曳圖片調整人物位置，方形框內的內容會成為大頭貼。</p>
        <div className="photo-crop-viewport">
          {image ? <img src={previewUrl} alt="裁切預覽" style={{ width: renderedWidth, height: renderedHeight, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }} onPointerDown={startDragging} onPointerMove={drag} onPointerUp={() => setDragStart(undefined)} onPointerCancel={() => setDragStart(undefined)} /> : <span>載入圖片中…</span>}
          <span className="photo-crop-frame" aria-hidden="true" />
        </div>
        <label className="photo-crop-zoom">縮放<input aria-label="縮放" type="range" min="1" max="3" step=".05" value={zoom} onChange={(event) => changeZoom(Number(event.target.value))} disabled={!image} /><span>{zoom.toFixed(2)}×</span></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="photo-crop-actions"><button type="button" className="button-secondary" onClick={onCancel}>取消</button><button type="button" className="button-primary" onClick={confirm} disabled={!image}>確認裁切</button></div>
      </section>
    </div>
  )
}
