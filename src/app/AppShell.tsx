import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

export function AppShell() {
  return (
    <main className="app-shell">
      <div className="app-content"><Outlet /></div>
      <BottomNav />
    </main>
  )
}
