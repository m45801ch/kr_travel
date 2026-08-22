import { db } from '../../data/db'

export async function compressPhoto(file: File, maxEdge = 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('圖片壓縮失敗')), 'image/webp', .82))
}

export async function savePhoto(id: string, blob: Blob): Promise<void> { await db.photos.put({ id, blob }) }
export async function getPhoto(id: string): Promise<Blob | undefined> { return (await db.photos.get(id))?.blob }
export async function deletePhoto(id: string): Promise<void> { await db.photos.delete(id) }

export function getAllPhotoIds(item: { photoId?: string; photoIds?: string[] }): string[] {
  if (item.photoIds?.length) return item.photoIds
  if (item.photoId) return [item.photoId]
  return []
}
