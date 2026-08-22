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
  { id: 'airport-travel', label: '機場旅行', category: '旅遊', accent: '#8ba9d6', emoji: '✈️' },
  { id: 'shopping-bag', label: '購物袋', category: '配件', accent: '#f4c768', emoji: '🛍️' },
  { id: 'camera-travel', label: '相機隨身帶', category: '配件', accent: '#d58e83', emoji: '📷' },
  { id: 'korean-house', label: '韓屋', category: '旅遊', accent: '#d58e83', emoji: '🏠' },
  { id: 'food', label: '韓式美食', category: '旅遊', accent: '#ef8490', emoji: '🍜' },
  { id: 'food-bibimbap', label: '石鍋拌飯', category: '美食', accent: '#ef8490', emoji: '🍚', imageUrl: foodBibimbapImage },
  { id: 'cafe-dessert', label: '咖啡甜點', category: '美食', accent: '#f4c768', emoji: '🍰', imageUrl: cafeDessertImage },
  { id: 'hanok-stay', label: '韓屋住宿', category: '住宿', accent: '#d58e83', emoji: '🏡', imageUrl: hanokStayImage },
  { id: 'transit', label: '地鐵旅行', category: '配件', accent: '#78bda7', emoji: '🚇' },
  { id: 'transit-subway', label: '可愛地鐵', category: '交通', accent: '#78bda7', emoji: '🚆', imageUrl: transitSubwayImage },
  { id: 'gyeongbokgung-palace', label: '景福宮', category: '景點', accent: '#ef8490', emoji: '🏯', imageUrl: gyeongbokgungPalaceImage },
  { id: 'namsan-tower', label: '南山塔', category: '景點', accent: '#8ba9d6', emoji: '🗼', imageUrl: namsanTowerImage },
  { id: 'gen-acc-15', label: '配件 acc-15', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_15 },
  { id: 'gen-acc-16', label: '配件 acc-16', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_16 },
  { id: 'gen-acc-17', label: '配件 acc-17', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_17 },
  { id: 'gen-acc-18', label: '配件 acc-18', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_18 },
  { id: 'gen-acc-19', label: '配件 acc-19', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_19 },
  { id: 'gen-acc-20', label: '配件 acc-20', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_20 },
  { id: 'gen-acc-21', label: '配件 acc-21', category: '配件', accent: '#f4c768', emoji: '👜', imageUrl: gen_acc_21 },
  { id: 'gen-char-01', label: '人物 char-01', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_01 },
  { id: 'gen-char-02', label: '人物 char-02', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_02 },
  { id: 'gen-char-03', label: '人物 char-03', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_03 },
  { id: 'gen-char-04', label: '人物 char-04', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_04 },
  { id: 'gen-char-05', label: '人物 char-05', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_05 },
  { id: 'gen-char-06', label: '人物 char-06', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_06 },
  { id: 'gen-char-07', label: '人物 char-07', category: '人物', accent: '#ef8490', emoji: '👤', imageUrl: gen_char_07 },
  { id: 'gen-food-29', label: '美食 food-29', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_29 },
  { id: 'gen-food-30', label: '美食 food-30', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_30 },
  { id: 'gen-food-31', label: '美食 food-31', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_31 },
  { id: 'gen-food-32', label: '美食 food-32', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_32 },
  { id: 'gen-food-33', label: '美食 food-33', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_33 },
  { id: 'gen-food-34', label: '美食 food-34', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_34 },
  { id: 'gen-food-35', label: '美食 food-35', category: '美食', accent: '#ef8490', emoji: '🍱', imageUrl: gen_food_35 },
  { id: 'gen-outfit-08', label: '服裝 outfit-08', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_08 },
  { id: 'gen-outfit-09', label: '服裝 outfit-09', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_09 },
  { id: 'gen-outfit-10', label: '服裝 outfit-10', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_10 },
  { id: 'gen-outfit-11', label: '服裝 outfit-11', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_11 },
  { id: 'gen-outfit-12', label: '服裝 outfit-12', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_12 },
  { id: 'gen-outfit-13', label: '服裝 outfit-13', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_13 },
  { id: 'gen-outfit-14', label: '服裝 outfit-14', category: '服裝', accent: '#b19bd4', emoji: '👗', imageUrl: gen_outfit_14 },
  { id: 'gen-spot-47', label: '景點 spot-47', category: '景點', accent: '#8ba9d6', emoji: '🏯', imageUrl: gen_spot_47 },
  { id: 'gen-spot-48', label: '景點 spot-48', category: '景點', accent: '#8ba9d6', emoji: '🏯', imageUrl: gen_spot_48 },
  { id: 'gen-spot-49', label: '景點 spot-49', category: '景點', accent: '#8ba9d6', emoji: '🏯', imageUrl: gen_spot_49 },
  { id: 'gen-stay-36', label: '住宿 stay-36', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_36 },
  { id: 'gen-stay-37', label: '住宿 stay-37', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_37 },
  { id: 'gen-stay-38', label: '住宿 stay-38', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_38 },
  { id: 'gen-stay-39', label: '住宿 stay-39', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_39 },
  { id: 'gen-stay-40', label: '住宿 stay-40', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_40 },
  { id: 'gen-stay-41', label: '住宿 stay-41', category: '住宿', accent: '#d58e83', emoji: '🏨', imageUrl: gen_stay_41 },
  { id: 'gen-transit-42', label: '交通 transit-42', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_42 },
  { id: 'gen-transit-43', label: '交通 transit-43', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_43 },
  { id: 'gen-transit-44', label: '交通 transit-44', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_44 },
  { id: 'gen-transit-45', label: '交通 transit-45', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_45 },
  { id: 'gen-transit-46', label: '交通 transit-46', category: '交通', accent: '#78bda7', emoji: '🚇', imageUrl: gen_transit_46 },
  { id: 'gen-travel-22', label: '旅遊 travel-22', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_22 },
  { id: 'gen-travel-23', label: '旅遊 travel-23', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_23 },
  { id: 'gen-travel-24', label: '旅遊 travel-24', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_24 },
  { id: 'gen-travel-25', label: '旅遊 travel-25', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_25 },
  { id: 'gen-travel-26', label: '旅遊 travel-26', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_26 },
  { id: 'gen-travel-27', label: '旅遊 travel-27', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_27 },
  { id: 'gen-travel-28', label: '旅遊 travel-28', category: '旅遊', accent: '#8ba9d6', emoji: '✈️', imageUrl: gen_travel_28 },
]

export const illustrationCategories: IllustrationCategory[] = ['人物', '服裝', '配件', '旅遊', '美食', '住宿', '交通', '景點']

export function getIllustration(id: IllustrationId) {
  return illustrationCatalog.find((item) => item.id === id) ?? illustrationCatalog[0]
}
