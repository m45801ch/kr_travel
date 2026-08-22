import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BottomNav } from '../components/BottomNav'
import { SakuraEffect } from '../components/SakuraEffect'
import { db } from '../data/db'
import { applyTheme } from '../features/settings/themes'

export function AppShell() {
  const settings = useLiveQuery(() => db.settings.get('global'), [], undefined)

  useEffect(() => {
    if (!settings) return
    applyTheme(settings)
  }, [settings])

  return (
    <main className="app-shell">
      {settings?.effects && <SakuraEffect key="sakura-effect" />}
      <div className="app-content"><Outlet /></div>
      <BottomNav />
    </main>
  )
}
