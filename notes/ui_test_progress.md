# UI 測試進度筆記(更新)

## 環境
- 專案:/home/ubuntu/kr_travel-master,GitHub 儲存庫 m45801ch/kr_travel
- vite dev 於 localhost:5173 執行中(日志 /tmp/vite.log)
- 測試網址 http://localhost:5173/itinerary(外網 proxy 有問題,使用 localhost 即可)

## 已驗證通過
1. 天氣抓取修復成功:點擊更新後顯示 30°/25° 雷雨 Seoul(原本 --° 抓不到)
2. 行程標題編輯:點擊 h1「首爾小旅行」→ 內嵌輸入 → 改為「我的首爾之旅」→ Enter 儲存成功
3. 日期範圍編輯:08-25~08-29 改為 08-25~08-31,成功重建為 7 天(日期條變 7 格),儲存成功
   - 注意:date input 曾被瀏覽器污染成 "260831-08-29",已加 onChange 正規化( /^d{4}-d{2}-d{2}$/ 才接受)與 saveDates sanitize fallback
4. 新增活動:填入「景福宮參觀」+ 地點「景福宮」→ 儲存 → 卡片出現,含編輯按鈕(Edit3)

## 待測
- 點擊活動卡上編輯按鈕(元素提示「編輯 景福宮參觀」)→ 表單應預填值、標題「編輯行程」、按鈕「儲存修改」
- 修改後儲存確認更新
- 各天標題編輯:點擊「Day 1 抵達」卡片標題 → 內嵌輸入 → 改「Day 1 景福宮」→ 完成
- 完整測試後:pnpm test + tsc -b → git add/commit/push 回 GitHub

## 修改過的檔案
- src/integrations/weather/koreanPlaces.ts(新增對照表)
- src/integrations/weather/openMeteo.ts(改寫 geocode:KR 限域 + alias fallback)
- src/integrations/weather/geocode.test.ts(新增 5 個測試)
- src/features/itinerary/ItineraryPage.tsx(標題/日期/天標題編輯、活動再編輯)
- src/features/itinerary/ActivityCard.tsx(加 onEdit/Edit3 按鈕)
- src/features/itinerary/ActivityForm.tsx(支援 initial 活動)
- src/data/repositories/tripRepository.ts(加 deleteActivitiesByDay)
- src/styles/inline-edit.css(新增樣式,已掛入 main.tsx)

## 天氣問題原因(供回答使用者)
- Open-Meteo geocoding API 查不到中文地名「首爾」(任何 language 都不行),英文 Seoul 可
- 且未限 country_code=KR,「Jeju」會錯配到衣索比亞
- 修復:韓國地名對照表 + country_code=KR 優先搜尋 + 備援不限國搜尋
