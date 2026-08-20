import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { PagePreview } from './app/routes'
import { ItineraryPage } from './features/itinerary/ItineraryPage'
import { ExpensePage } from './features/expenses/ExpensePage'
import { ListPage } from './features/lists/ListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/itinerary" replace />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/shopping" element={<ListPage type="shopping" />} />
          <Route path="/prep" element={<ListPage type="prep" />} />
          <Route path="/settings" element={<PagePreview title="設置" subtitle="個人化你的旅遊規劃體驗" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
