import { describe, expect, it } from 'vitest'
import { illustrationCatalog } from './illustrations'

describe('圖案預設設定', () => {
  it('使用匯出的圖案名稱與分類作為內建預設', () => {
    const find = (id: string) => illustrationCatalog.find((item) => item.id === id)

    expect(find('gen-acc-15')).toMatchObject({ label: '收提包', category: '配件' })
    expect(find('gen-char-01')).toMatchObject({ label: '韓服女孩', category: '人物' })
    expect(find('gen-food-31')).toMatchObject({ label: '炸機啤酒', category: '美食' })
    expect(find('gen-outfit-08')).toMatchObject({ label: '休閒女孩', category: '人物' })
    expect(find('gen-spot-47')).toMatchObject({ label: '公車02', category: '交通' })
    expect(find('gen-stay-36')).toMatchObject({ label: '庭園民宿', category: '住宿' })
    expect(find('gen-transit-42')).toMatchObject({ label: '露營', category: '住宿' })
    expect(find('gen-travel-26')).toMatchObject({ label: '地鐵入口', category: '交通' })
    expect(find('airport-travel')).toMatchObject({ category: '交通' })
    expect(find('food')).toMatchObject({ category: '美食' })
    expect(find('transit')).toMatchObject({ category: '交通' })
  })
})
