import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { PagePreview } from './app/routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/itinerary" replace />} />
          <Route path="/itinerary" element={<PagePreview title="今日行程" subtitle="規劃你的韓國旅程" />} />
          <Route path="/expenses" element={<PagePreview title="旅行記帳" subtitle="掌握每一筆旅費" />} />
          <Route path="/shopping" element={<PagePreview title="購物清單" subtitle="記錄想帶回家的東西" />} />
          <Route path="/prep" element={<PagePreview title="行前準備" subtitle="出發前一步一步完成" />} />
          <Route path="/settings" element={<PagePreview title="設置" subtitle="個人化你的旅遊規劃體驗" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
