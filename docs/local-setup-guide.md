# 本機開發與測試指南(kr_travel)

本文件說明 E:\My build\kr_travel-master 目前的 Git 狀態,以及如何在本機啟動並測試五項新功能。

## 一、Git 初始化已完成(由 Manus 於 2026-08-21 完成)

目前本機資料夾的 Git 狀態如下表所示:

| 項目 | 狀態 |
| --- | --- |
| 資料夾 | E:\My build\kr_travel-master |
| 本地分支 | master(與 GitHub 遠端同步,內容完全一致) |
| 遠端連結 | origin → https://github.com/m45801ch/kr_travel.git |
| 最新版本 | commit 5ce05f4(新增編輯功能與天氣修復) |
| node_modules | 已存在(353 個套件,無需重新安裝) |

## 二、常用的 Git 指令

| 目的 | 指令 |
| --- | --- |
| 拉取 GitHub 最新版 | `git pull origin master` |
| 上傳本機修改到 GitHub | `git add .` → `git commit -m "說明"` → `git push origin master` |
| 查看目前狀態 | `git status` |

> 注意:`git push` 需要 GitHub 授權。建議使用 Personal Access Token(在 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) 建立,勾選 repo 權限),push 時密碼欄位輸入 token。token 30 天有效,到期需重新建立。

## 三、啟動開發伺服器(npm run dev)

1. 按 `Win + R`,輸入 `cmd` 或 `powershell` 開啟終端機。
2. 切換到專案資料夾:
   ```
   cd "E:\My build\kr_travel-master"
   ```
3. 啟動開發伺服器:
   ```
   npm run dev
   ```
4. 看到類似 `Local: http://localhost:5173/` 的訊息後,開啟瀏覽器前往 **http://localhost:5173**。
5. 修改程式碼後儲存,頁面會自動更新(Hot Reload),不需重新執行指令。
6. 要停止伺服器時,回到終端機按 `Ctrl + C`。

## 四、測試五項新功能

以下每項功能都在「行程」頁面(http://localhost:5173/itinerary)測試:

### 功能 1:行程標題可修改
1. 進入行程頁面。
2. 直接點擊頁面最上方的標題(例如「首爾小旅行」),標題會變成輸入框。
3. 輸入新標題,按 **Enter** 儲存;或點擊標題外任一位置也會儲存。

### 功能 2:日期範圍可自訂
1. 點擊標題下方的日期範圍文字(例如「2026-08-25 — 2026-08-29」)。
2. 出現「開始日期」與「結束日期」兩個輸入框,各輸入新日期(格式 YYYY-MM-DD,例如 2026-09-01)。
3. 點擊「完成」儲存。行程會自動重建對應天數(例如 09-01 至 09-04 共 4 天)。

### 功能 3:活動可再次編輯
1. 在任意一天的活動卡片上,點擊卡片右上角的**鉛筆(編輯)圖示**。
2. 開啟表單時標題會顯示「編輯行程」,表單已填入原本資料。
3. 修改內容後點擊「儲存修改」,卡片會立即更新。

### 功能 4:各天標題可修改
1. 點擊任意一天的標題(例如「Day 1 抵達」或「Day 1 首爾探索」)。
2. 標題變成輸入框,輸入任意文字(例如「Day 1 抵達・景福宮之旅」)。
3. 按 **Enter** 或點擊標題外儲存。

### 功能 5:天氣資料修復
1. 在行程頁面頂部找到天氣卡片。
2. 點擊「更新天氣」按鈕。
3. 目的地欄位輸入「首爾」或「Seoul」,都應能顯示首爾的每日天氣預報(溫度、天氣狀況)。
4. 其他韓國城市如釜山(Busan)、濟州(Jeju)、春川(Chuncheon)、江陵(Gangneung)同樣支援中英文地名。

## 五、常見問題

- **npm run dev 失敗**:確認 Node.js 已安裝(執行 `node -v` 應顯示版本號)。若缺套件,執行 `npm install`。
- **天氣仍抓不到**:檢查目的地欄位的名稱是否為常見譯名(首爾、釜山、濟州等);若填入非常用中文地名,可能查不到,請改用英文名稱。
- **Port 5173 被佔用**:Vite 會自動改用 5174、5175…,終端機會顯示實際網址。
