import fs from 'node:fs'
import path from 'node:path'

const key = process.env.VITE_LABNANA_API_KEY || 'lh_sk_69eaf4c594d32d8cbd2b725f_f29f1b23b65aca26014f3daa9d199d2fcef8f03e589fcfcd'
const baseUrl = process.env.VITE_LABNANA_BASE_URL || 'https://api.labnana.com'

// 參照原本可愛風格：圓潤、柔和色調、扁平插畫、白色背景、韓系可愛
const prompt = `
可愛風格插畫網格，白色背景，1:1 正方形畫布內以 7列7行共49個獨立圖標整齊排列（再加1個在中心，共50個），每個圖標外有清晰白色留白和淡淡網格線，便於後續裁切分離。

風格要求：韓系可愛、圓潤線條、柔和粉彩色調（粉紅 #f5a0aa、霧藍 #8ba9d6、薄荷綠 #78bda7、薰衣草紫 #b19bd4、鵝黃 #f4c768）、扁平插畫、簡約無陰影、線條乾淨，與現有插畫風格完全一致。

請按以下8類平均分配，每類6-7個，圖標需多樣化且易於辨識：

1. 人物：韓服女生、韓服男生、旅行女生、旅行男生、旅伴合照、背包客、導遊
2. 服裝：街頭潮流女裝、街頭潮流男裝、層次穿搭外套、連衣裙、韓式校服、帽子
3. 配件：購物袋、相機、行李箱、太陽眼鏡、帽子、飾品
4. 旅遊：機場、韓屋、韓式街道、地鐵站、旅遊巴士
5. 美食：石鍋拌飯、咖啡甜點、炸雞啤酒、年糕、紫菜包飯、韓式烤肉
6. 住宿：韓屋住宿、現代酒店、民宿、帳篷
7. 交通：地鐵、可愛地鐵列車、公車、計程車
8. 景點：景福宮、南山塔、東大門、漢江、明洞

每個圖標保持獨立、居中、大小一致，整體和諧可愛，適合做 App 的插畫選項
`.trim()

const payload = {
  provider: 'google',
  model: 'gemini-3-pro-image',
  prompt,
  imageConfig: { imageSize: '2K', aspectRatio: '1:1' }
}

console.log('Generating 50-icon grid with Labnana...')
console.log('Prompt length:', prompt.length)
console.log('Payload:', JSON.stringify(payload).slice(0, 500))

const res = await fetch(`${baseUrl}/openapi/v1/images/generation`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
  body: JSON.stringify(payload)
})

const data = await res.json()
console.log('Status:', res.status)
if (!res.ok) {
  console.error('Failed:', data)
  process.exit(1)
}
if (data.code && data.code !== 0) {
  console.error('API error:', data)
  process.exit(1)
}

const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
if (!part?.inlineData?.data) {
  console.error('No image data', JSON.stringify(data).slice(0, 3000))
  process.exit(1)
}

const outDir = path.resolve('generated')
fs.mkdirSync(outDir, { recursive: true })
const mime = part.inlineData.mimeType || 'image/png'
const ext = mime.split('/')[1] || 'png'
const outPath = path.join(outDir, `labnana-50grid-2K-1x1.${ext}`)
fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'))
console.log(`Saved to ${outPath} (${mime}, ${fs.statSync(outPath).size} bytes)`)
console.log('Done. Free usages will be consumed if available, otherwise credits.')
