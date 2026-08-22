# 韓國旅遊 PWA 部署說明

## 本機開發

```bash
npm install
npm run dev
```

手機測試可使用同一個 Wi-Fi 開啟 Vite 顯示的 Network URL：

```bash
npm run dev -- --host 0.0.0.0
```

## Production build

```bash
npm test
npm run build
npm run preview -- --host 0.0.0.0
```

`dist/` 目錄就是可部署內容。

## Vercel／Netlify／Cloudflare Pages

- Build command：`npm run build`
- Output directory：`dist`
- Node.js：使用平台目前支援的 LTS 版本
- 必須使用 HTTPS，Service Worker 與 PWA 安裝才會正常運作

若使用 Vercel，可直接匯入 Git repository，通常不需要額外設定。部署完成後，用手機開啟 HTTPS 網址即可。

## 手機安裝

- Android Chrome：開啟網站 → 瀏覽器選單 →「安裝應用程式」或「加到主畫面」。
- iPhone Safari：開啟網站 → 分享 →「加入主畫面」。

## 資料注意事項

第一版資料只存在目前裝置的 IndexedDB，不會自動跨裝置同步。清除瀏覽器資料可能刪除旅程，因此請在「設置」定期匯出 JSON 備份。匯入備份會以 ID 覆寫同 ID 的資料，不會自動刪除未出現在備份中的資料。

天氣更新需要網路；離線時會顯示最後一次成功取得的資料。Google Maps 導航也需要網路，網站只會在點擊時開啟外部 Google Maps。
