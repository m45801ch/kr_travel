import { useEffect, useState } from 'react'
import type { Settings } from '../../domain/types'
import { db } from '../../data/db'
import { BackupControls } from './BackupControls'
import { InstallHelp } from './InstallHelp'
import { ThemeControls } from './ThemeControls'
import { IllustrationManager } from '../illustrations/IllustrationManager'
import { APP_VERSION } from '../../app/version'
import { applyTheme } from './themes'
import { ThemeHeaderArt } from '../../components/ThemeHeaderArt'

const defaultSettings: Settings = { id: 'global', themeColor: '#ef8490', themeId: 'classic', fontScale: 1, darkMode: false, effects: false, defaultCurrency: 'TWD' }

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  useEffect(() => { void db.settings.get('global').then((saved) => { if (saved) setSettings(saved) }) }, [])
  const update = (next: Settings) => { setSettings(next); applyTheme(next); void db.settings.put(next) }
    return <section className="settings-page"><header className="page-header themed-header themed-header-settings"><ThemeHeaderArt kind="settings" /><div>
<p className="eyebrow">PERSONALIZE</p><h1>設置</h1><p>個人化你的旅遊規劃體驗</p></div></header><ThemeControls settings={settings} onChange={update} /><IllustrationManager /><BackupControls onImported={() => window.location.reload()} /><InstallHelp /><section className="settings-card"><h2>目前版本</h2><div className="version-row"><p>旅遊規劃 PWA · 本機優先版本</p><strong>{APP_VERSION}</strong></div></section></section>
}
