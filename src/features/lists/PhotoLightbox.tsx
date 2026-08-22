import { useEffect, useState } from 'react'

export function PhotoLightbox({ urls, initialIndex = 0, onClose }: { urls: string[]; initialIndex?: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => setIndex(initialIndex), [initialIndex])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setIndex((i) => (i < urls.length - 1 ? i + 1 : i))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, urls.length])

  if (!urls.length) return null
  const src = urls[index] ?? urls[0]

  return (
    <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="照片預覽" onClick={onClose}>
      <button type="button" className="photo-lightbox-close" aria-label="關閉" onClick={onClose}>×</button>
      <img
        className="photo-lightbox-img"
        src={src}
        alt={`照片 ${index + 1} / ${urls.length}`}
        onClick={(e) => e.stopPropagation()}
      />
      {urls.length > 1 && (
        <>
          <div className="photo-lightbox-counter">{index + 1} / {urls.length}</div>
          {index > 0 && (
            <button type="button" className="photo-lightbox-nav prev" aria-label="上一張" onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1) }}>‹</button>
          )}
          {index < urls.length - 1 && (
            <button type="button" className="photo-lightbox-nav next" aria-label="下一張" onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1) }}>›</button>
          )}
        </>
      )}
    </div>
  )
}
