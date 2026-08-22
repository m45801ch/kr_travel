from PIL import Image
import os

src = r"E:\My build\kr_travel-master\generated\labnana-50grid-2K-1x1.png"
out_dir = r"E:\My build\kr_travel-master\src\assets\illustrations\generated"
os.makedirs(out_dir, exist_ok=True)

im = Image.open(src)
w, h = im.size
print(f"Source: {w}x{h} {im.mode}")

cols, rows = 7, 7
tile_w = w // cols
tile_h = h // rows

# For better handling, add 4px padding crop (centered)
# The generated grid has white spacing, so we can add 8px inset to avoid grid lines
inset = 6  # pixels to trim from each side to avoid grid lines

count = 0
for r in range(rows):
    for c in range(cols):
        left = c * tile_w + inset
        upper = r * tile_h + inset
        right = (c + 1) * tile_w - inset
        lower = (r + 1) * tile_h - inset
        # Clamp to image bounds
        left = max(0, left)
        upper = max(0, upper)
        right = min(w, right)
        lower = min(h, lower)
        tile = im.crop((left, upper, right, lower))
        # Resize to 512x512 for consistency with existing webp (which are ~500px)
        tile = tile.resize((512, 512), Image.LANCZOS)
        # Determine category based on position (distribute 8 categories)
        # 0-6: 人物, 7-13: 服裝, 14-20: 配件, 21-27: 旅遊, 28-34: 美食, 35-40: 住宿, 41-45: 交通, 46-48: 景點
        idx = r * cols + c
        if idx < 7:
            cat, prefix = "人物", "char"
        elif idx < 14:
            cat, prefix = "服裝", "outfit"
        elif idx < 21:
            cat, prefix = "配件", "acc"
        elif idx < 28:
            cat, prefix = "旅遊", "travel"
        elif idx < 35:
            cat, prefix = "美食", "food"
        elif idx < 41:
            cat, prefix = "住宿", "stay"
        elif idx < 46:
            cat, prefix = "交通", "transit"
        else:
            cat, prefix = "景點", "spot"
        filename = f"{prefix}-{idx+1:02d}.webp"
        out_path = os.path.join(out_dir, filename)
        tile.save(out_path, "WEBP", quality=88)
        count += 1
        print(f"Saved {filename} ({cat}) {tile.size}")

print(f"Done: {count} tiles to {out_dir}")

# Also save a preview of the grid with red lines for verification
try:
    from PIL import ImageDraw
    preview = im.copy()
    draw = ImageDraw.Draw(preview)
    for c in range(1, cols):
        x = c * tile_w
        draw.line([(x, 0), (x, h)], fill=(255,0,0,128), width=2)
    for r in range(1, rows):
        y = r * tile_h
        draw.line([(0, y), (w, y)], fill=(255,0,0,128), width=2)
    preview_path = os.path.join(out_dir, "_grid-preview.webp")
    preview = preview.resize((1024, 1024), Image.LANCZOS)
    preview.save(preview_path, "WEBP", quality=88)
    print(f"Preview grid saved to {preview_path}")
except Exception as e:
    print(f"Preview failed: {e}")
