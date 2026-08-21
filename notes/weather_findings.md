# 天氣資料排查結果

## 目前機制
- 資料來源:Open-Meteo(公開免費 API,無需金鑰)
- 地點取得方式:以 Trip.destination(字串,如「首爾」)呼叫 Open-Meteo geocoding API 做「文字搜尋」,不是 GPS,也不是手動輸入經緯度
- 流程:geocodeDestination(destination) → 取得 lat/lng → getForecast(lat, lng, date)
- 有 IndexedDB weatherCache 快取;抓不到時退回舊快取(isStale),完全沒有時丟錯

## 抓不到的原因
- Open-Meteo geocoding API 查不到中文地名「首爾」(任何 language 參數都不行)
- 「Seoul」英文 → OK(緯度 37.566, 經度 126.9784)
- 中文「釜山」「濟州」也都查不到
- 韓文「서울특별시」「부산광역시」查得到,但「서울」「부산」查不到
- Jeju 不限制 country_code 會錯誤匹配到埃塞俄比亞的 Jeju → 需要 country_code=KR 限域
- 結論:使用者 trip.destination='首爾'(中文)→ geocode 無結果 → 丟「找不到目的地」→ 天氣抓不到

## 修復方向
1. 優先使用 country_code=KR 限域搜尋(韓旅 app 目的地幾乎都在韓國)
2. 中文地名 fallback:維護常用韓地名對照表(首爾→Seoul、釜山→Busan、濟州→Jeju City…)
3. 嘗試多種拼法(原名、英文名、漢字)後再放棄
4. 失敗時回退到上次快取並顯示友善訊息,不要直接崩頁面
