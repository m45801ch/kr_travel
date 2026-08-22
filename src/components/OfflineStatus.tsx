import { useEffect, useState } from 'react'

type ConnectionState = 'online' | 'offline' | 'restored' | 'offline-ready' | 'update'

export function OfflineStatus() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(() => navigator.onLine ? 'online' : 'offline')
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>)>()

  useEffect(() => {
    const handleOffline = () => setConnectionState('offline')
    const handleOnline = () => setConnectionState('restored')
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    if (import.meta.env.PROD) {
      void import('virtual:pwa-register').then(({ registerSW }) => {
        const reload = registerSW({
          immediate: true,
          onNeedRefresh: () => setConnectionState('update'),
          onOfflineReady: () => setConnectionState((current) => current === 'online' ? 'offline-ready' : current),
          onRegisterError: () => setConnectionState((current) => current === 'online' ? 'offline' : current),
        })
        setUpdateSW(() => reload)
      })
    }

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  const message = connectionState === 'offline'
    ? '目前離線，資料仍可在本機使用'
    : connectionState === 'restored'
      ? '已恢復連線'
      : connectionState === 'offline-ready'
        ? '離線使用已準備完成'
        : connectionState === 'update'
          ? '有新版可用，請重新整理以套用更新'
          : '目前連線正常'

  return <div className={`offline-status offline-status-${connectionState}`} role="status">
    <span>{message}</span>
    {connectionState === 'update' && updateSW && <button type="button" onClick={() => void updateSW()}>重新整理</button>}
  </div>
}
