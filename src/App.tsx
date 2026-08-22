import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { ItineraryPage } from './features/itinerary/ItineraryPage'
import { ExpensePage } from './features/expenses/ExpensePage'
import { ListPage } from './features/lists/ListPage'
import { SettingsPage } from './features/settings/SettingsPage'

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
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
