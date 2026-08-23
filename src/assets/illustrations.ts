import type { IllustrationId } from '../domain/types'
import companionBoyImage from './illustrations/companion-boy.webp'
import companionFriendsImage from './illustrations/companion-friends.webp'
import companionGirlImage from './illustrations/companion-girl.webp'
import foodBibimbapImage from './illustrations/food-bibimbap.webp'
import cafeDessertImage from './illustrations/cafe-dessert.webp'
import outfitLayeredImage from './illustrations/outfit-layered.webp'
import hanokStayImage from './illustrations/hanok-stay.webp'
import transitSubwayImage from './illustrations/transit-subway.webp'
import gyeongbokgungPalaceImage from './illustrations/gyeongbokgung-palace.webp'
import namsanTowerImage from './illustrations/namsan-tower.webp'
import gen_acc_15 from './illustrations/generated/acc-15.webp'
import gen_acc_16 from './illustrations/generated/acc-16.webp'
import gen_acc_17 from './illustrations/generated/acc-17.webp'
import gen_acc_18 from './illustrations/generated/acc-18.webp'
import gen_acc_19 from './illustrations/generated/acc-19.webp'
import gen_acc_20 from './illustrations/generated/acc-20.webp'
import gen_acc_21 from './illustrations/generated/acc-21.webp'
import gen_char_01 from './illustrations/generated/char-01.webp'
import gen_char_02 from './illustrations/generated/char-02.webp'
import gen_char_03 from './illustrations/generated/char-03.webp'
import gen_char_04 from './illustrations/generated/char-04.webp'
import gen_char_05 from './illustrations/generated/char-05.webp'
import gen_char_06 from './illustrations/generated/char-06.webp'
import gen_char_07 from './illustrations/generated/char-07.webp'
import gen_food_29 from './illustrations/generated/food-29.webp'
import gen_food_30 from './illustrations/generated/food-30.webp'
import gen_food_31 from './illustrations/generated/food-31.webp'
import gen_food_32 from './illustrations/generated/food-32.webp'
import gen_food_33 from './illustrations/generated/food-33.webp'
import gen_food_34 from './illustrations/generated/food-34.webp'
import gen_food_35 from './illustrations/generated/food-35.webp'
import gen_outfit_08 from './illustrations/generated/outfit-08.webp'
import gen_outfit_09 from './illustrations/generated/outfit-09.webp'
import gen_outfit_10 from './illustrations/generated/outfit-10.webp'
import gen_outfit_11 from './illustrations/generated/outfit-11.webp'
import gen_outfit_12 from './illustrations/generated/outfit-12.webp'
import gen_outfit_13 from './illustrations/generated/outfit-13.webp'
import gen_outfit_14 from './illustrations/generated/outfit-14.webp'
import gen_spot_47 from './illustrations/generated/spot-47.webp'
import gen_spot_48 from './illustrations/generated/spot-48.webp'
import gen_spot_49 from './illustrations/generated/spot-49.webp'
import gen_stay_36 from './illustrations/generated/stay-36.webp'
import gen_stay_37 from './illustrations/generated/stay-37.webp'
import gen_stay_38 from './illustrations/generated/stay-38.webp'
import gen_stay_39 from './illustrations/generated/stay-39.webp'
import gen_stay_40 from './illustrations/generated/stay-40.webp'
import gen_stay_41 from './illustrations/generated/stay-41.webp'
import gen_transit_42 from './illustrations/generated/transit-42.webp'
import gen_transit_43 from './illustrations/generated/transit-43.webp'
import gen_transit_44 from './illustrations/generated/transit-44.webp'
import gen_transit_45 from './illustrations/generated/transit-45.webp'
import gen_transit_46 from './illustrations/generated/transit-46.webp'
import gen_travel_22 from './illustrations/generated/travel-22.webp'
import gen_travel_23 from './illustrations/generated/travel-23.webp'
import gen_travel_24 from './illustrations/generated/travel-24.webp'
import gen_travel_25 from './illustrations/generated/travel-25.webp'
import gen_travel_26 from './illustrations/generated/travel-26.webp'
import gen_travel_27 from './illustrations/generated/travel-27.webp'
import gen_travel_28 from './illustrations/generated/travel-28.webp'

export type IllustrationCategory = '人物' | '服裝' | '配件' | '旅遊' | '美食' | '住宿' | '交通' | '景點'

export interface IllustrationOption {
  id: IllustrationId
  label: string
  category: IllustrationCategory
  accent: string
  emoji: string
  imageUrl?: string
}

export const illustrationCatalog: IllustrationOption[] = [
  { id: 'hanbok-woman', label: '韓服女生', category: '人物', accent: '#f5a0aa', emoji: '👘' },
  { id: 'hanbok-man', label: '韓服男生', category: '人物', accent: '#8ba9d6', emoji: '🧥' },
  { id: 'companion-girl', label: '旅行女生', category: '人物', accent: '#ef8490', emoji: '👩🏻', imageUrl: companionGirlImage },
  { id: 'companion-boy', label: '旅行男生', category: '人物', accent: '#8ba9d6', emoji: '🧑🏻', imageUrl: companionBoyImage },
  { id: 'companion-friends', label: '旅伴一起出發', category: '人物', accent: '#d58e83', emoji: '🧑‍🤝‍🧑', imageUrl: companionFriendsImage },
  { id: 'streetwear-woman', label: '街頭女生', category: '服裝', accent: '#b19bd4', emoji: '🧢' },
  { id: 'streetwear-man', label: '街頭男生', category: '服裝', accent: '#78bda7', emoji: '🎒' },
  { id: 'outfit-layered', label: '換洗衣物', category: '服裝', accent: '#d58e83', emoji: '👕', imageUrl: outfitLayeredImage },
  { id: 'airport-travel', label: '機場旅行', category: '交通', accent: '#8ba9d6', emoji: '✈️' },
  { id: 'shopping-bag', label: '購物袋', category: '配件', accent: '#f4c768', emoji: '🛍️' },
  { id: 'camera-travel', label: '相機隨身帶', category: '配件', accent: '#d58e83', emoji: '📷' },
  { id: 'korean-house', label: '韓屋', category: '旅遊', accent: '#d58e83', emoji: '🏠' },
  { id: 'food', label: '韓式美食', category: '美食', accent: '#ef8490', emoji: '🍜' },
  { id: 'food-bibimbap', label: '石鍋拌飯', category: '美食', accent: '#ef8490', emoji: '🍚', imageUrl: foodBibimbapImage },
  { id: 'cafe-dessert', label: '咖啡甜點', category: '美食', accent: '#f4c768', emoji: '🍰', imageUrl: cafeDessertImage },
  { id: 'hanok-stay', label: '韓屋住宿', category: '住宿', accent: '#d58e83', emoji: '🏡', imageUrl: hanokStayImage },
  { id: 'transit', label: '地鐵旅行', category: '交通', accent: '#78bda7', emoji: '🚇' },
  { id: 'transit-subway', label: '可愛地鐵', category: '交通', accent: '#78bda7', emoji: '🚆', imageUrl: transitSubwayImage },
  { id: 'gyeongbokgung-palace', label: '景福宮', category: '景點', accent: '#ef8490', emoji: '🏯', imageUrl: gyeongbokgungPalaceImage },
  { id: 'namsan-tower', label: '南山塔', category: '景點', accent: '#8ba9d6', emoji: '🗼', imageUrl: namsanTowerImage },
  { id: 'gen-acc-15', label: '收提包', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_15 },
  { id: 'gen-acc-16', label: '專業相機', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_16 },
  { id: 'gen-acc-17', label: '行李箱', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_17 },
  { id: 'gen-acc-18', label: '墨鏡', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_18 },
  { id: 'gen-acc-19', label: '毛帽', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_19 },
  { id: 'gen-acc-20', label: '圓頂毛帽', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_20 },
  { id: 'gen-acc-21', label: '可愛髮箍', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_21 },
  { id: 'gen-char-01', label: '韓服女孩', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_01 },
  { id: 'gen-char-02', label: '韓服男孩', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_02 },
  { id: 'gen-char-03', label: '背包女孩', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_03 },
  { id: 'gen-char-04', label: '攝影男孩', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_04 },
  { id: 'gen-char-05', label: '旅遊照片', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_05 },
  { id: 'gen-char-06', label: '登山男孩', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_06 },
  { id: 'gen-char-07', label: '正式裝扮', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_07 },
  { id: 'gen-food-29', label: '拉麵', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_29 },
  { id: 'gen-food-30', label: '咖啡巧克力甜點', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_30 },
  { id: 'gen-food-31', label: '炸機啤酒', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_31 },
  { id: 'gen-food-32', label: '韓式年糕', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_32 },
  { id: 'gen-food-33', label: '明太子', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_33 },
  { id: 'gen-food-34', label: '壽司', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_34 },
  { id: 'gen-food-35', label: '烤肉', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_35 },
  { id: 'gen-outfit-08', label: '休閒女孩', category: '人物', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_08 },
  { id: 'gen-outfit-09', label: '休閒男孩', category: '人物', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_09 },
  { id: 'gen-outfit-10', label: '外套', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_10 },
  { id: 'gen-outfit-11', label: '洋裝', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_11 },
  { id: 'gen-outfit-12', label: '高校女制服', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_12 },
  { id: 'gen-outfit-13', label: '高校水手服', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_13 },
  { id: 'gen-outfit-14', label: '漁夫帽', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_14 },
  { id: 'gen-spot-47', label: '公車02', category: '交通', accent: '#8ba9d6', emoji: '🏯', imageUrl: gen_spot_47 },
  { id: 'gen-spot-48', label: '公車03', category: '交通', accent: '#8ba9d6', emoji: '🏯', imageUrl: gen_spot_48 },
  { id: 'gen-spot-49', label: '自駕車', category: '交通', accent: '#8ba9d6', emoji: '🏯', imageUrl: gen_spot_49 },
  { id: 'gen-stay-36', label: '庭園民宿', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_36 },
  { id: 'gen-stay-37', label: '旅社', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_37 },
  { id: 'gen-stay-38', label: '日式民宿', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_38 },
  { id: 'gen-stay-39', label: '帳篷', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_39 },
  { id: 'gen-stay-40', label: '旅館', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_40 },
  { id: 'gen-stay-41', label: '民宿', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_41 },
  { id: 'gen-transit-42', label: '露營', category: '住宿', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_42 },
  { id: 'gen-transit-43', label: '電聯車', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_43 },
  { id: 'gen-transit-44', label: '火車', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_44 },
  { id: 'gen-transit-45', label: '遊覽車', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_45 },
  { id: 'gen-transit-46', label: '計程車', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_46 },
  { id: 'gen-travel-22', label: '機場', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_22 },
  { id: 'gen-travel-23', label: '日屋', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_23 },
  { id: 'gen-travel-24', label: '逛街', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_24 },
  { id: 'gen-travel-25', label: '地圖', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_25 },
  { id: 'gen-travel-26', label: '地鐵入口', category: '交通', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_26 },
  { id: 'gen-travel-27', label: '公車', category: '交通', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_27 },
  { id: 'gen-travel-28', label: '巴士', category: '交通', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_28 },
]

export const illustrationCategories: IllustrationCategory[] = ['人物', '服裝', '配件', '旅遊', '美食', '住宿', '交通', '景點']

export function getIllustration(id: IllustrationId) {
  return illustrationCatalog.find((item) => item.id === id) ?? illustrationCatalog[0]
}
