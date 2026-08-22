# 旅行應急備份 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不依賴遠端伺服器的情況下，匯出可閱讀且可還原的旅程應急備份。

**Architecture:** 擴充現有 `src/data/backup.ts`，共用本機 IndexedDB 資料讀取，產生 HTML、CSV 與 JSON Blob。設定頁只負責下載 Blob 與顯示狀態，HTML 將照片與 QR Code 轉成 data URL 內嵌。

**Tech Stack:** React、TypeScript、Dexie、Vitest、原生 Blob／File API。

## Global Constraints

- 不新增伺服器或雲端依賴。
- JSON 匯入格式維持 `schemaVersion: 1` 相容。
- HTML 必須可離線獨立開啟。

### Task 1: 備份輸出格式

**Files:**
- Modify: `src/data/backup.ts`
- Test: `src/data/backup.test.ts`

- [ ] 先測試 HTML、CSV 內容與圖片 data URL。
- [ ] 實作 HTML escaping、CSV escaping、照片轉 data URL。
- [ ] 實作 `exportEmergencyHtml` 與 `exportEmergencyCsv`。
- [ ] 執行備份測試與完整測試。

### Task 2: 設定頁下載入口

**Files:**
- Modify: `src/features/settings/BackupControls.tsx`
- Modify: `src/styles/app.css`

- [ ] 將單一匯出按鈕改為「匯出旅行應急包」，下載 HTML、CSV、JSON。
- [ ] 顯示匯出成功／失敗狀態與說明。
- [ ] 保留 JSON 匯入功能。
- [ ] 執行正式建置與完整測試。

### Task 3: 完成驗證

- [ ] 執行 `npm test`。
- [ ] 執行 `npm run build`。
- [ ] 執行 `git diff --check`。
