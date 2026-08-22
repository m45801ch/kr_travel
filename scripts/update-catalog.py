import os

base = r"E:\My build\kr_travel-master\src\assets\illustrations\generated"
files = sorted([f for f in os.listdir(base) if f.endswith(".webp") and not f.startswith("_")])
print(files)

# Map prefix to category and accent
cat_map = {
    "char": ("人物", "#ef8490", "👤"),
    "outfit": ("服裝", "#b19bd4", "👗"),
    "acc": ("配件", "#f4c768", "👜"),
    "travel": ("旅遊", "#8ba9d6", "✈️"),
    "food": ("美食", "#ef8490", "🍱"),
    "stay": ("住宿", "#d58e83", "🏨"),
    "transit": ("交通", "#78bda7", "🚇"),
    "spot": ("景點", "#8ba9d6", "🏯"),
}

# Generate imports and entries
imports = []
entries = []

for fname in files:
    prefix = fname.split("-")[0]
    cat, accent, emoji = cat_map.get(prefix, ("旅遊", "#ef8490", "✨"))
    # id from filename without extension
    fid = fname.replace(".webp", "")
    # e.g., char-01 -> gen-char-01 to avoid collision
    id = f"gen-{fid}"
    var = f"gen{prefix.capitalize()}{fid.split('-')[1]}"  # e.g., genChar01
    # Ensure unique var name
    var = f"gen_{fid.replace('-','_')}"
    imports.append(f"import {var} from './illustrations/generated/{fname}'")
    label = f"{cat} {fid}"
    entries.append(f"  {{ id: '{id}', label: '{label}', category: '{cat}', accent: '{accent}', emoji: '{emoji}', imageUrl: {var} }},")

# Read existing catalog
with open(r"E:\My build\kr_travel-master\src\assets\illustrations.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Find insertion point: before closing ]
# We will generate new file
header = """import type { IllustrationId } from '../domain/types'
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
"""

# Add generated imports
header += "\n".join(imports) + "\n\n"

body = """export type IllustrationCategory = '人物' | '服裝' | '配件' | '旅遊' | '美食' | '住宿' | '交通' | '景點'

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
"""

# Add generated entries
body += "\n".join(entries) + "\n]\n\n"
body += """export const illustrationCategories: IllustrationCategory[] = ['人物', '服裝', '配件', '旅遊', '美食', '住宿', '交通', '景點']

export function getIllustration(id: IllustrationId) {
  return illustrationCatalog.find((item) => item.id === id) ?? illustrationCatalog[0]
}
"""

full = header + body
with open(r"E:\My build\kr_travel-master\src\assets\illustrations.ts", "w", encoding="utf-8") as f:
    f.write(full)

print(f"Wrote {len(entries)} new illustrations, total {15+len(entries)}")
