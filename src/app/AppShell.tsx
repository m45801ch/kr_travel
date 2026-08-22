import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BottomNav } from '../components/BottomNav'
import { SakuraEffect } from '../components/SakuraEffect'
import { db } from '../data/db'

export function AppShell() {
  const settings = useLiveQuery(() => db.settings.get('global'), [], undefined)

  useEffect(() => {
    if (!settings) return
    document.documentElement.style.setProperty('--color-accent', settings.themeColor)
    document.documentElement.style.fontSize = `${settings.fontScale}rem`
    document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light'
  }, [settings])

  return (
    <main className="app-shell">
      {settings?.effects && <SakuraEffect />}
      <div className="app-content"><Outlet /></div>
      <BottomNav />
    </main>
  )
}
