import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { FloatingAddButton } from '../components/FloatingAddButton'

const addLabels: Record<string, string> = {
  '/itinerary': '新增行程',
  '/expenses': '新增支出',
  '/shopping': '新增購物',
  '/prep': '新增準備',
  '/settings': '新增旅程',
}

export function AppShell() {
  const location = useLocation()
  return (
    <main className="app-shell">
      <div className="app-content"><Outlet /></div>
      <FloatingAddButton label={addLabels[location.pathname] ?? '新增'} />
      <BottomNav />
    </main>
  )
}
