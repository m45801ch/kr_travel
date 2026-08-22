const BASE_URL = (import.meta.env.VITE_LABNANA_BASE_URL as string | undefined) ?? 'https://api.labnana.com'

function getApiKey(): string {
  const fromEnv = (import.meta.env.VITE_LABNANA_API_KEY as string | undefined)?.trim()
  if (fromEnv) return fromEnv
  // 允許在設置頁透過 localStorage 覆寫（避免把 Key 寫進前端 bundle）
  try {
    const fromStorage = localStorage.getItem('labnana_api_key')?.trim()
    if (fromStorage) return fromStorage
  } catch {
    // ignore
  }
  return ''
}

export function hasLabnanaApiKey(): boolean {
  return Boolean(getApiKey())
}

export function setLabnanaApiKey(key: string): void {
  try {
    if (key.trim()) localStorage.setItem('labnana_api_key', key.trim())
    else localStorage.removeItem('labnana_api_key')
  } catch {
    // ignore
  }
}

type LabnanaSubscription = {
  totalAvailableCredits: number
  freeUsages: Record<string, { remaining: number; resourceKey: string }>
  [k: string]: unknown
}

export async function getLabnanaSubscription(): Promise<{ code: number; message: string; data: LabnanaSubscription }> {
  const key = getApiKey()
  if (!key) throw new Error('尚未設定 Labnana API Key（請在 .env 設定 VITE_LABNANA_API_KEY 或於設置頁輸入）')
  const res = await fetch(`${BASE_URL}/openapi/v1/user/subscription`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`取得訂閱資訊失敗：${res.status} ${text}`)
  }
  return res.json()
}

export type ImageGenerationParams = {
  provider: 'google' | 'openai' | 'alibaba' | 'bytedance'
  model?: string
  prompt: string
  referenceImages?: Array<{ fileData: { fileUri: string; mimeType: string } }>
  imageConfig?: { imageSize?: '1K' | '2K' | '4K'; aspectRatio?: string }
}

export type ImageGenerationResponse = {
  candidates?: Array<{
    content: { parts: Array<{ inlineData?: { mimeType: string; data: string } }> }
  }>
  code?: number
  message?: string
}

export async function generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
  const key = getApiKey()
  if (!key) throw new Error('尚未設定 Labnana API Key')
  const res = await fetch(`${BASE_URL}/openapi/v1/images/generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(params),
  })
  const data = (await res.json().catch(() => null)) as ImageGenerationResponse | null
  if (!res.ok) {
    throw new Error((data as { message?: string })?.message ?? `圖片生成失敗：${res.status}`)
  }
  if ((data as { code?: number })?.code && (data as { code?: number }).code !== 0) {
    throw new Error((data as { message?: string }).message ?? `API 錯誤：${(data as { code?: number }).code}`)
  }
  return data as ImageGenerationResponse
}

export function extractImageDataUrl(response: ImageGenerationResponse): string | null {
  const parts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
    }
  }
  return null
}
