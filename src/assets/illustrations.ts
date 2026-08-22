import type { IllustrationId } from '../domain/types'

export type IllustrationCategory = '人物' | '服裝' | '配件' | '旅遊'

export interface IllustrationOption {
  id: IllustrationId
  label: string
  category: IllustrationCategory
  accent: string
  emoji: string
}

export const illustrationCatalog: IllustrationOption[] = [
  { id: 'hanbok-woman', label: '韓服女生', category: '人物', accent: '#f5a0aa', emoji: '👘' },
  { id: 'hanbok-man', label: '韓服男生', category: '人物', accent: '#8ba9d6', emoji: '🧥' },
  { id: 'streetwear-woman', label: '街頭女生', category: '服裝', accent: '#b19bd4', emoji: '🧢' },
  { id: 'streetwear-man', label: '街頭男生', category: '服裝', accent: '#78bda7', emoji: '🎒' },
  { id: 'airport-travel', label: '機場旅行', category: '旅遊', accent: '#8ba9d6', emoji: '✈️' },
  { id: 'shopping-bag', label: '購物袋', category: '配件', accent: '#f4c768', emoji: '🛍️' },
  { id: 'korean-house', label: '韓屋', category: '旅遊', accent: '#d58e83', emoji: '🏠' },
  { id: 'food', label: '韓式美食', category: '旅遊', accent: '#ef8490', emoji: '🍜' },
  { id: 'transit', label: '地鐵旅行', category: '配件', accent: '#78bda7', emoji: '🚇' },
]

export function getIllustration(id: IllustrationId) {
  return illustrationCatalog.find((item) => item.id === id) ?? illustrationCatalog[0]
}
