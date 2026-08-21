# 韓國旅遊 PWA

手機優先的韓國旅遊規劃工具，包含：

- 行程、日期、天氣與 Google Maps 連結
- 預算、外幣換算、平均／自訂分帳
- 購物與行前準備清單
- 韓國服裝與旅遊圖案選擇器
- IndexedDB 本機資料、JSON 備份、PWA 離線快取

## 指令

```bash
npm install
npm run dev
npm test
npm run build
```

在 Windows 上也可以直接雙擊專案根目錄的 `start-dev.bat`，切換至專案目錄並執行 `npm run dev`。

在行程頁選取日期後，展開「搜尋國家城市的天氣地點」面板，即可在下拉選單最上方先用中文搜尋國家／地區，再選擇該國內建的中文城市；按下「更新天氣地點」後才會依該城市重新抓取天氣。由於 Open-Meteo 預報服務只提供有限天數的預報，太遠的日期會在天氣卡片顯示「此日期超出目前可預報範圍」的明確提示。

## 版本

目前版本為 **V1.0.10**，顯示於設定頁的「目前版本」卡片，版本來源集中在 `src/app/version.ts`。每次完成專案修改後，修訂號需增加 `0.0.1`；例如 `V1.0.1` 修改為 `V1.0.2`，並同步更新 `package.json` 與 `package-lock.json` 的版本欄位。

部署與手機安裝請參考 [docs/deployment.md](docs/deployment.md)。
