# 記帳付款方式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將來源專案的付款方式完整移植至目標專案的旅行記帳功能。

**Architecture:** 以 `PaymentMethod` union type 和集中式選項工具作為單一資料來源；表單負責寫入付款方式，ExpensePage 負責篩選與列表整合，PaymentMethodSummary 負責統計展示。付款方式欄位保持 optional，直接相容既有 IndexedDB 與備份資料。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite、現有 CSS token。

## Global Constraints

- 保留目前工作區既有未提交修改，不覆蓋自定支出類別相關變更。
- 不新增依賴、不修改 IndexedDB schema version、不移植付款方式以外的來源功能。
- 舊資料缺少付款方式時顯示「未設定」，未知付款方式值正規化為「其他」。
- 驗收命令：`npm test`、`npm run lint`、`npm run build`。

### Task 1: 建立付款方式型別與選項工具

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/features/expenses/paymentMethods.ts`
- Test: `src/features/expenses/paymentMethods.test.ts`

**Interfaces:**
- Produces `PaymentMethod`, `PaymentMethodOption`, `paymentMethodOptions`, `getPaymentMethodLabel`, `normalizePaymentMethod`。

- [ ] **Step 1: Write the failing test**

測試所有選項數量、標籤，以及空值與未知值的顯示／正規化行為。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/expenses/paymentMethods.test.ts`
Expected: FAIL because the payment method module and type do not exist.

- [ ] **Step 3: Write minimal implementation**

新增來源專案相同的 11 個 ID 與顯示名稱；`getPaymentMethodLabel(undefined)` 回傳「未填寫付款方式」，未知 ID 回傳「其他」；`normalizePaymentMethod` 將未知值轉為 `other`。在 `Expense` 加入 `paymentMethod?: PaymentMethod`。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/features/expenses/paymentMethods.test.ts`
Expected: PASS。

### Task 2: 將付款方式接入 ExpenseForm

**Files:**
- Modify: `src/features/expenses/ExpenseForm.tsx`
- Modify: `src/features/expenses/ExpenseForm.test.tsx`

**Interfaces:**
- Consumes: Task 1 的 `PaymentMethod` 工具與選項。
- Produces: 新增／編輯支出時在 `onSave` 的 Expense payload 中提供 `paymentMethod`。

- [ ] **Step 1: Write the failing test**

在表單測試中選取 `google-pay` 後儲存，期待 payload 的 `paymentMethod` 為 `google-pay`；另測試既有 `apple-pay` 編輯資料會初始化付款方式選單。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/expenses/ExpenseForm.test.tsx`
Expected: FAIL because付款方式選單不存在且 payload 沒有欄位。

- [ ] **Step 3: Write minimal implementation**

新增 `paymentMethod` state，新增預設 `cash`，編輯時使用 `normalizePaymentMethod(initial.paymentMethod)`；在表單加入有 `aria-label="付款方式"` 的 select；submit 時寫入 Expense。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/features/expenses/ExpenseForm.test.tsx`
Expected: PASS。

### Task 3: 加入頁面篩選、列表標示與付款統計

**Files:**
- Create: `src/features/expenses/PaymentMethodSummary.tsx`
- Modify: `src/features/expenses/ExpensePage.tsx`
- Modify: `src/styles/app.css`
- Modify: `src/features/expenses/ExpensePage.test.tsx`

**Interfaces:**
- Consumes: Task 1 的付款方式工具，以及現有 ExpensePage 的 categoryExpenses、format、Expense 列表資料。
- Produces: `PaymentMethodSummary` 元件與 `PaymentMethodFilter` 型別；頁面可依付款方式篩選。

- [ ] **Step 1: Write the failing test**

建立兩筆不同付款方式的 expense，驗證付款方式統計、列表標籤、下拉篩選與統計卡片點擊篩選；另驗證沒有付款方式的舊資料出現在「未設定」。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/expenses/ExpensePage.test.tsx`
Expected: FAIL because the page沒有付款方式統計、篩選與標示。

- [ ] **Step 3: Write minimal implementation**

在 ExpensePage 加入 `paymentMethodFilter` state，先依類別取得 `categoryExpenses` 再依付款方式取得 `visibleExpenses`；新增付款方式 filter select、PaymentMethodSummary 與列表付款標籤。Summary 以 `baseAmountMinor` 分組，顯示總額／筆數／比例，點擊目前卡片可回到 `all`。加入來源專案對應的 layout、卡片、狀態與手機版樣式。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/features/expenses/ExpensePage.test.tsx`
Expected: PASS。

### Task 4: 全量驗證與差異檢查

**Files:**
- Verify: `src/domain/types.ts`
- Verify: `src/features/expenses/paymentMethods.ts`
- Verify: `src/features/expenses/PaymentMethodSummary.tsx`
- Verify: `src/features/expenses/ExpenseForm.tsx`
- Verify: `src/features/expenses/ExpensePage.tsx`
- Verify: `src/styles/app.css`

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: exit code 0 and no failed tests。

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: exit code 0 and no ESLint errors。

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: exit code 0 with successful TypeScript and Vite build。

- [ ] **Step 4: Inspect the final diff**

Run: `git diff -- src/domain/types.ts src/features/expenses src/styles/app.css`
Expected: only付款方式相關程式與測試變更；既有工作區其他修改仍保留。

