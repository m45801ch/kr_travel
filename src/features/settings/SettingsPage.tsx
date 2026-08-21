import { useEffect, useState } from 'react'
import type { Settings } from '../../domain/types'
import { db } from '../../data/db'
import { BackupControls } from './BackupControls'
import { InstallHelp } from './InstallHelp'
import { ThemeControls } from './ThemeControls'
import { APP_VERSION } from '../../app/version'

const defaultSettings: Settings = { id: 'global', themeColor: '#ef8490', fontScale: 1, darkMode: false, effects: false, defaultCurrency: 'TWD' }

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  useEffect(() => { void db.settings.get('global').then((saved) => { if (saved) setSettings(saved) }) }, [])
  const update = (next: Settings) => { setSettings(next); document.documentElement.style.setProperty('--color-accent', next.themeColor); document.documentElement.style.fontSize = `${next.fontScale}rem`; document.documentElement.dataset.theme = next.darkMode ? 'dark' : 'light'; void db.settings.put(next) }
  return <section className="settings-page"><header className="page-header"><div><p className="eyebrow">PERSONALIZE</p><h1>設置</h1><p>個人化你的旅遊規劃體驗</p></div></header><ThemeControls settings={settings} onChange={update} /><BackupControls onImported={() => window.location.reload()} /><InstallHelp /><section className="settings-card"><h2>目前版本</h2><div className="version-row"><p>韓國旅遊 PWA · 本機優先版本</p><strong>{APP_VERSION}</strong></div></section></section>
}
