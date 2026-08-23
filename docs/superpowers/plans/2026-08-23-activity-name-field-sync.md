# 新增行程名稱欄位同步 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在新增行程表單輸入名稱時，自動填入尚未手動修改的「地點」與「地址／搜尋關鍵字」。

**Architecture:** `ActivityForm` 維持現有欄位狀態，額外追蹤兩個欄位是否仍由名稱自動帶入。名稱變更時，只更新空白或仍等於上一個自動帶入名稱的欄位；使用者手動修改後，該欄位停止同步。儲存時仍照現有 Activity 結構分別保存三個欄位。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite。

## Global Constraints

- 不覆蓋使用者已手動修改的地點或地址。
- 新增與編輯行程都使用相同同步規則。
- 不修改 Activity 資料結構或地圖 URL 產生規則。

---

### Task 1: 為名稱同步行為建立失敗測試

**Files:**
- Modify: `src/features/itinerary/ActivityForm.test.tsx`

- [ ] **Step 1: 新增測試案例**

測試新增表單輸入名稱後，地點與地址會同步顯示名稱；再修改名稱時，兩欄也會同步更新。

```tsx
it('輸入名稱時會同步填入地點與地址，且名稱修改後會更新自動帶入欄位', async () => {
  const user = userEvent.setup()
  render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" onSave={vi.fn()} onCancel={vi.fn()} />)

  await user.type(screen.getByRole('textbox', { name: '名稱' }), '東京鐵塔')
  expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('東京鐵塔')
  expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('東京鐵塔')

  await user.clear(screen.getByRole('textbox', { name: '名稱' }))
  await user.type(screen.getByRole('textbox', { name: '名稱' }), '晴空塔')
  expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('晴空塔')
  expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('晴空塔')
})
```

- [ ] **Step 2: 執行測試確認目前行為失敗**

Run: `npm test -- --run src/features/itinerary/ActivityForm.test.tsx`

Expected: 新增測試 FAIL，因目前輸入名稱不會填入地點與地址。

### Task 2: 實作欄位同步與手動修改保護

**Files:**
- Modify: `src/features/itinerary/ActivityForm.tsx`

- [ ] **Step 1: 加入自動同步狀態**

以目前名稱作為自動帶入欄位的標記，新增兩個 boolean 狀態：`locationAutoFilled`、`addressAutoFilled`。初始化編輯資料時，原欄位空白或等於原名稱都視為可自動填入。

- [ ] **Step 2: 更新名稱輸入處理**

新增 `handleTitleChange`：名稱變更時，若地點或地址仍為空白，或仍等於上一個自動帶入名稱，就同步更新；若使用者已手動輸入不同內容，保留內容並停止該欄位同步。

- [ ] **Step 3: 將地點與地址輸入改為可辨識手動修改**

地點或地址的 `onChange` 只要收到使用者輸入，就將該欄位的自動同步狀態設為 false；原本的輸入值照常更新。

### Task 3: 驗證手動修改不會被覆蓋

**Files:**
- Modify: `src/features/itinerary/ActivityForm.test.tsx`

- [ ] **Step 1: 新增手動修改保護測試**

測試先輸入名稱，再手動改地點與地址，最後修改名稱；預期手動內容保留。

```tsx
it('使用者手動修改地點或地址後，名稱變更不會覆蓋手動內容', async () => {
  const user = userEvent.setup()
  render(<ActivityForm tripId="trip-1" dayId="day-1" date="2026-08-25" onSave={vi.fn()} onCancel={vi.fn()} />)

  await user.type(screen.getByRole('textbox', { name: '名稱' }), '東京鐵塔')
  await user.clear(screen.getByRole('textbox', { name: '地點' }))
  await user.type(screen.getByRole('textbox', { name: '地點' }), '赤羽橋站')
  await user.clear(screen.getByRole('textbox', { name: '名稱' }))
  await user.type(screen.getByRole('textbox', { name: '名稱' }), '晴空塔')

  expect(screen.getByRole('textbox', { name: '地點' })).toHaveValue('赤羽橋站')
  expect(screen.getByRole('textbox', { name: '地址／搜尋關鍵字' })).toHaveValue('晴空塔')
})
```

- [ ] **Step 2: 執行完整相關測試**

Run: `npm test -- --run src/features/itinerary/ActivityForm.test.tsx src/features/itinerary/ActivityInteractions.test.tsx`

Expected: 所有相關測試 PASS。

### Task 4: 建置與工作區驗證

- [ ] **Step 1: 執行型別檢查與正式建置**

Run: `npm run build`

Expected: Vite build 成功並產生 `dist/`。

- [ ] **Step 2: 檢查差異格式與工作區狀態**

Run: `git diff --check; git status --short`

Expected: 沒有 whitespace errors；只包含本功能相關的程式與測試變更。
