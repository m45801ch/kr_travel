import { useEffect, useState } from 'react'
import { getLabnanaSubscription, hasLabnanaApiKey, setLabnanaApiKey } from '../../integrations/labnana/labnana'

export function LabnanaSettings() {
  const [input, setInput] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [credits, setCredits] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setHasKey(hasLabnanaApiKey())
    try {
      const saved = localStorage.getItem('labnana_api_key')
      if (saved) setInput(saved)
      else {
        const envKey = (import.meta.env.VITE_LABNANA_API_KEY as string | undefined) ?? ''
        if (envKey) setInput(envKey)
      }
    } catch {
      // ignore
    }
  }, [])

  const mask = (key: string) => {
    if (key.length <= 12) return '••••'
    return `${key.slice(0, 8)}••••${key.slice(-4)}`
  }

  const save = () => {
    setLabnanaApiKey(input.trim())
    setHasKey(hasLabnanaApiKey())
    setStatus(input.trim() ? `已儲存：${mask(input.trim())}` : '已清除')
    setTimeout(() => setStatus(''), 2500)
  }

  const check = async () => {
    setLoading(true)
    setCredits('')
    setStatus('')
    try {
      const res = await getLabnanaSubscription()
      const d = res.data as Record<string, unknown>
      const total = (d.totalAvailableCredits as number | undefined) ?? 0
      const free = d.freeUsages as Record<string, { remaining: number }> | undefined
      const freeStr = free ? Object.entries(free).map(([k, v]) => `${k.split(':').pop()}: ${v.remaining}`).join(' / ') : '—'
      setCredits(`可用積分 ${total}｜免費額度 ${freeStr}`)
      setStatus('連線成功')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : '連線失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="settings-card">
      <h2>Labnana 圖片生成</h2>
      <p>Base URL：<code>https://api.labnana.com</code>。Key 僅存於本機 <code>.env</code> 或 <code>localStorage</code>，不會提交到版本控制。</p>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontWeight: 700, fontSize: '.82rem' }}>API Key {hasKey ? '(已設定)' : '(未設定)'}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="lh_sk_..."
          spellCheck={false}
          autoComplete="off"
          style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 14, padding: '10px 12px', fontFamily: 'monospace' }}
        />
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="button-primary compact" onClick={save}>儲存 Key</button>
        <button type="button" className="button-secondary compact" onClick={check} disabled={loading}>{loading ? '檢查中…' : '測試連線 / 查詢積分'}</button>
        <button type="button" className="button-secondary compact" onClick={() => { setInput(''); setLabnanaApiKey(''); setHasKey(false); setStatus('已清除'); }}>清除</button>
      </div>
      {status && <p style={{ margin: 0, color: status.includes('成功') || status.includes('已儲存') ? 'var(--color-accent)' : '#b3261e', fontSize: '.78rem' }}>{status}</p>}
      {credits && <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '.78rem' }}>{credits}</p>}
      <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '.72rem', lineHeight: 1.5 }}>
        文件：<a href="https://labnana.com/docs/openapi/guide" target="_blank" rel="noreferrer">接入指南</a> ／ <a href="https://docs.marswave.ai/openapi-labnana.html" target="_blank" rel="noreferrer">OpenAPI</a>。切勿在前端直接暴露 Key 至公開倉庫。
      </p>
    </section>
  )
}
