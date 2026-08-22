# 韓國旅遊 PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一個手機優先、可安裝、可離線使用的韓國旅遊規劃 PWA，包含行程、記帳、購物、準備與設置五個功能。

**Architecture:** 使用 React + Vite + TypeScript 的本機優先架構。畫面透過功能模組與 Repository 存取 IndexedDB；天氣服務與 Google Maps URL 以獨立 adapter 封裝，PWA 使用 Manifest、Service Worker 與快取策略。

**Tech Stack:** React, Vite, TypeScript, React Router, Dexie, Vitest, Testing Library, vite-plugin-pwa, CSS Modules／全域 CSS Design Tokens, Open-Meteo API。

## Global Constraints

- 第一版為單人本機儲存，不建立登入、雲端同步或多人即時協作。
- 底部導航固定只有「行程、記帳、購物、準備、設置」。
- Google Maps 只產生外部搜尋／導航連結，不嵌入地圖，也不使用 Google Maps API Key。
- 天氣使用 Open-Meteo，網路失敗時顯示最後一次快取資料與更新時間。
- 使用者資料存於 IndexedDB，金額以最小貨幣單位整數儲存。
- 韓系人物、韓服、街頭服裝與配件使用原創插畫資產，以 `illustrationId` 參照。
- 介面必須手機優先、支援安全區域、深色模式與字體大小調整。
- 必須提供 JSON 資料匯出／匯入，避免本機資料無法備份。

---

### Task 1: 建立專案與測試基礎

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/test/setup.ts`
- Create: `src/app/App.test.tsx`
- Create: `.gitignore`

**Interfaces:**
- Produces a runnable Vite React TypeScript app and a Vitest environment using jsdom.

- [ ] **Step 1: Scaffold the app**

Run:

```bash
npm create vite@latest . -- --template react-ts
npm install react-router-dom dexie dexie-react-hooks lucide-react
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vite-plugin-pwa
```

Expected: `npm run dev` starts the Vite app and `npm run build` completes successfully.

- [ ] **Step 2: Configure the test command**

Add to `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Configure `vite.config.ts` with `test.environment = "jsdom"` and `test.setupFiles = "./src/test/setup.ts"`.

- [ ] **Step 3: Write the shell smoke test**

```tsx
it("renders the travel app shell", () => {
  render(<App />);
  expect(screen.getByText("行程")).toBeInTheDocument();
  expect(screen.getByText("記帳")).toBeInTheDocument();
  expect(screen.getByText("購物")).toBeInTheDocument();
  expect(screen.getByText("準備")).toBeInTheDocument();
  expect(screen.getByText("設置")).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the test and build**

Run: `npm test -- --run src/app/App.test.tsx` and `npm run build`

Expected: the smoke test passes and Vite emits a production build.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json index.html src .gitignore
git commit -m "chore: scaffold travel PWA"
```

### Task 2: 建立資料模型、IndexedDB 與 Repository

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/data/db.ts`
- Create: `src/data/repositories/tripRepository.ts`
- Create: `src/data/repositories/expenseRepository.ts`
- Create: `src/data/repositories/listRepository.ts`
- Create: `src/data/repositories/memberRepository.ts`
- Create: `src/data/repositories/repository.test.ts`

**Interfaces:**
- `TripRepository`: `getActiveTrip(): Promise<Trip | undefined>`, `saveTrip(trip: Trip): Promise<void>`
- `ExpenseRepository`: `listByTrip(tripId: string): Promise<Expense[]>`, `save(expense: Expense): Promise<void>`
- `ListRepository`: `listByTrip(tripId: string, type: ListType): Promise<ListItem[]>`, `save(item: ListItem): Promise<void>`
- All IDs are strings; all timestamps are ISO strings; all money values are integer minor units.

- [ ] **Step 1: Write domain types and failing repository tests**

Define `Trip`, `TripDay`, `Activity`, `Member`, `Expense`, `ExpenseSplit`, `ListItem`, `WeatherCache`, `Settings`, `ListType`, and `IllustrationId` in `src/domain/types.ts`.

Test that a saved trip can be read back, an expense is scoped by `tripId`, and shopping and prep items are separated by `type`.

- [ ] **Step 2: Implement the Dexie schema**

Create tables for `trips`, `days`, `activities`, `members`, `expenses`, `expenseSplits`, `listItems`, `weatherCache`, and `settings`. Index every child table by `tripId` and use `id` as the primary key.

- [ ] **Step 3: Implement repositories**

Repositories must use the Dexie instance only; React components must not import Dexie directly. `save` must overwrite by ID, and list methods must sort by date/order before returning.

- [ ] **Step 4: Run data tests**

Run: `npm test -- --run src/data/repositories/repository.test.ts`

Expected: all repository tests pass without network access.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/data
git commit -m "feat: add local travel data layer"
```

### Task 3: 建立手機 Layout、導航、主題與圖案選擇器

**Files:**
- Create: `src/app/routes.tsx`, `src/app/AppShell.tsx`
- Create: `src/components/BottomNav.tsx`, `src/components/FloatingAddButton.tsx`
- Create: `src/components/IllustrationPicker.tsx`
- Create: `src/assets/illustrations.ts`
- Create: `src/styles/tokens.css`, `src/styles/app.css`
- Create: `src/components/IllustrationPicker.test.tsx`

**Interfaces:**
- `IllustrationPicker({ value, onChange, categories }): JSX.Element`
- `AppShell` renders exactly five navigation destinations and a route outlet.
- `illustrations.ts` exports `illustrationCatalog: IllustrationOption[]` with stable IDs.

- [ ] **Step 1: Write picker tests**

Test that the picker renders category filters, calls `onChange("hanbok-woman")` when that option is clicked, supports reset, and keeps the selected option accessible by label.

- [ ] **Step 2: Add original bundled illustration components**

Create lightweight inline SVG or CSS illustrations for `hanbok-woman`, `hanbok-man`, `streetwear-woman`, `streetwear-man`, `airport-travel`, `shopping-bag`, `korean-house`, `food`, and `transit`. Export metadata only through `illustrationCatalog`; store only IDs in user records.

- [ ] **Step 3: Implement the mobile shell**

Add safe-area padding, a scrollable main region, fixed bottom navigation, route-aware active state, and a contextual floating add button. Use CSS variables for background, surface, text, accent, border, radius, shadow, font scale, and dark mode.

- [ ] **Step 4: Run UI tests and build**

Run: `npm test -- --run src/components/IllustrationPicker.test.tsx src/app/App.test.tsx` and `npm run build`

Expected: navigation and picker tests pass; narrow screens have no horizontal overflow.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components src/assets src/styles
git commit -m "feat: add mobile app shell and illustration picker"
```

### Task 4: 實作行程、天氣與 Google Maps 連結

**Files:**
- Create: `src/features/itinerary/ItineraryPage.tsx`, `src/features/itinerary/ActivityForm.tsx`
- Create: `src/features/itinerary/DateStrip.tsx`, `src/features/itinerary/WeatherCard.tsx`, `src/features/itinerary/ActivityCard.tsx`
- Create: `src/integrations/weather/openMeteo.ts`, `src/integrations/weather/weatherRepository.ts`
- Create: `src/integrations/maps/googleMapsUrl.ts`
- Create: `src/features/itinerary/itinerary.test.tsx`, `src/integrations/maps/googleMapsUrl.test.ts`

**Interfaces:**
- `buildGoogleMapsSearchUrl(query: string): string`
- `getForecast(latitude: number, longitude: number, date: string): Promise<WeatherSnapshot>`
- `getCachedOrFetchWeather(tripId: string, date: string, location: GeoLocation): Promise<WeatherSnapshot>`

- [ ] **Step 1: Write failing map and page tests**

Test URL encoding, activity creation, date switching, and cached weather rendering when the fetch rejects.

- [ ] **Step 2: Implement map URL generation**

Return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` and render it with `target="_blank"` and an accessible label.

- [ ] **Step 3: Implement weather adapter and cache fallback**

Call Open-Meteo only from the integration module. Save successful results with `updatedAt`; on failure return the most recent matching cached result with an `isStale` flag, or a clear unavailable state when no cache exists.

- [ ] **Step 4: Implement itinerary UI and activity form**

Render date strip, weather card, day summary, ordered activity cards, add/edit/delete actions, location fields, time, category, notes, reminder, and illustration picker. Save through repositories and refresh the selected day after mutations.

- [ ] **Step 5: Run itinerary tests and commit**

Run: `npm test -- --run src/features/itinerary src/integrations/maps/googleMapsUrl.test.ts`

Expected: all tests pass with mocked weather fetches and no real network calls.

```bash
git add src/features/itinerary src/integrations
git commit -m "feat: add itinerary weather and maps"
```

### Task 5: 實作記帳、匯率與旅伴分帳

**Files:**
- Create: `src/features/expenses/ExpensePage.tsx`, `src/features/expenses/ExpenseForm.tsx`
- Create: `src/features/expenses/BudgetCard.tsx`, `src/features/expenses/SettlementSummary.tsx`
- Create: `src/domain/money.ts`, `src/domain/splitting.ts`
- Create: `src/features/expenses/expense.test.ts`, `src/domain/money.test.ts`, `src/domain/splitting.test.ts`

**Interfaces:**
- `toMinorUnits(amount: string, currency: Currency): number`
- `convertMinorUnits(amount: number, rate: number): number`
- `splitExpense(expense: Expense, participants: SplitParticipant[]): ExpenseSplit[]`
- `calculateSettlement(expenses: Expense[], members: Member[]): Settlement[]`

- [ ] **Step 1: Write failing money and split tests**

Cover decimal input, invalid/negative amounts, equal split with remainder distribution, custom amounts that sum to the expense, and settlement balances where a payer paid for another member.

- [ ] **Step 2: Implement money and splitting domain functions**

Reject malformed amounts, preserve integer minor units, require custom split totals to equal the expense total, and distribute rounding remainder deterministically in member order.

- [ ] **Step 3: Implement expense UI**

Add budget card, currency and rate fields, category filters, expense list, payer selector, participant selector, equal/custom split controls, and settlement summary. Save expense and split records in one Dexie transaction.

- [ ] **Step 4: Run finance tests**

Run: `npm test -- --run src/domain/money.test.ts src/domain/splitting.test.ts src/features/expenses/expense.test.ts`

Expected: all calculation and UI tests pass without relying on current exchange rates.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/features/expenses
git commit -m "feat: add budget expenses and splitting"
```

### Task 6: 實作購物、準備清單與圖片分配

**Files:**
- Create: `src/features/lists/ListPage.tsx`, `src/features/lists/ListItemCard.tsx`
- Create: `src/features/lists/ListItemForm.tsx`, `src/features/lists/ProgressSummary.tsx`
- Create: `src/features/lists/photoStore.ts`
- Create: `src/features/lists/lists.test.tsx`

**Interfaces:**
- `ListPage({ type }: { type: "shopping" | "prep" }): JSX.Element`
- `compressPhoto(file: File, maxEdge: number): Promise<Blob>`
- `toggleListItem(id: string): Promise<void>`

- [ ] **Step 1: Write failing list tests**

Test filtering by category and completed state, progress totals, assignee display, deadline display, and shared form behavior for shopping versus prep.

- [ ] **Step 2: Implement the shared list page and cards**

Use the same list components with a `type` prop. Shopping includes purchase location; prep includes section and deadline. Both support category, priority, note, assignee, illustration ID, completion, edit, and delete.

- [ ] **Step 3: Implement photo compression and IndexedDB storage**

Resize the longest edge to 1024px, encode as JPEG/WebP where supported, store the Blob by item ID, and render a placeholder when no photo exists.

- [ ] **Step 4: Run list tests and commit**

Run: `npm test -- --run src/features/lists/lists.test.tsx`

Expected: shopping and prep tests pass; completing an item updates counts immediately.

```bash
git add src/features/lists
git commit -m "feat: add shopping and preparation lists"
```

### Task 7: 實作設置、備份與 PWA 安裝功能

**Files:**
- Create: `src/features/settings/SettingsPage.tsx`, `src/features/settings/ThemeControls.tsx`
- Create: `src/features/settings/BackupControls.tsx`, `src/features/settings/InstallHelp.tsx`
- Create: `src/data/backup.ts`, `src/data/backup.test.ts`
- Modify: `vite.config.ts`, `src/main.tsx`, `src/styles/tokens.css`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`

**Interfaces:**
- `exportBackup(): Promise<Blob>`
- `importBackup(file: File): Promise<BackupReport>`
- `applySettings(settings: Settings): void`

- [ ] **Step 1: Write failing backup tests**

Test that export includes the trip and all child records, import rejects malformed JSON and duplicate schema versions, and a valid backup restores records into an empty database.

- [ ] **Step 2: Implement versioned JSON backup**

Export `{ schemaVersion: 1, exportedAt, data }`; validate required arrays and IDs before writing. Import inside a transaction and report inserted counts without deleting existing data unless the user explicitly confirms replacement.

- [ ] **Step 3: Implement settings controls**

Persist theme color, font scale, dark mode, effects, default currency, and active trip ID. Apply settings via CSS variables and `prefers-color-scheme` only when the user has not selected an explicit mode.

- [ ] **Step 4: Configure PWA**

Configure `vite-plugin-pwa` with app name, standalone display, theme/background colors, icons, precache for built assets, and an update prompt. Add install help describing Android and iPhone steps.

- [ ] **Step 5: Run tests and build**

Run: `npm test -- --run src/data/backup.test.ts` and `npm run build`

Expected: backup tests pass and the build emits a manifest and service worker.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/features/settings src/data/backup.ts src/data/backup.test.ts src/styles public/icons src/main.tsx
git commit -m "feat: add settings backup and PWA install"
```

### Task 8: 整合驗收、手機測試與部署文件

**Files:**
- Create: `src/app/integration.test.tsx`
- Create: `docs/deployment.md`
- Modify: `README.md`

**Interfaces:**
- The final app must expose routes `/itinerary`, `/expenses`, `/shopping`, `/prep`, and `/settings`.

- [ ] **Step 1: Write the end-to-end integration test**

Test the flow: create trip, add activity with a Maps link, create expense with a split, add and complete a shopping item, change theme, export backup, and navigate through all five tabs.

- [ ] **Step 2: Run the complete test suite**

Run: `npm test` and `npm run build`

Expected: all tests pass and the production build completes with no TypeScript errors.

- [ ] **Step 3: Test the production preview**

Run: `npm run preview -- --host 0.0.0.0`

Open the preview URL from a phone on the same Wi-Fi and verify narrow layout, safe-area spacing, add/edit/delete flows, external Maps navigation, offline cached app shell, and PWA install prompt.

- [ ] **Step 4: Add deployment instructions**

Document Vercel deployment, HTTPS requirement, mobile install steps, local-only data warning, backup workflow, and how to update the PWA.

- [ ] **Step 5: Commit final verification docs**

```bash
git add src/app/integration.test.tsx docs/deployment.md README.md
git commit -m "docs: add deployment and acceptance checks"
```

## Self-review checklist

- Spec coverage: the plan covers five tabs, itinerary CRUD, weather cache, Maps URL, budget, currency conversion, equal/custom splitting, shopping and prep assignment, illustrations, settings, backups, PWA installation, offline behavior, deployment, and mobile acceptance.
- Placeholder scan: every implementation step contains concrete files, interfaces, commands, or expected behavior.
- Type consistency: repository methods, `illustrationId`, list `type`, backup `schemaVersion`, and money/splitting interfaces are defined before their consumers.
- Scope control: login, cloud sync, embedded maps, real-time collaboration, and app-store packaging remain explicitly out of scope for this MVP.
