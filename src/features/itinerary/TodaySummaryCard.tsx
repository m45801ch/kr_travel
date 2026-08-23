import { ArrowRight, CalendarCheck, CloudSun, ListChecks, WalletCards } from 'lucide-react'
import { fromMinorUnits } from '../../domain/money'
import type { Currency } from '../../domain/types'
import type { TodaySummary } from './todaySummary'

function formatMoney(amountMinor: number, currency: Currency): string {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(fromMinorUnits(amountMinor, currency))
}

export function TodaySummaryCard({ summary, currency }: { summary: TodaySummary; currency: Currency }) {
  const weatherLabel = summary.weather ? `${summary.weather.description} ${Math.round(summary.weather.temperatureMax)}° / ${Math.round(summary.weather.temperatureMin)}°` : '尚未取得天氣'
  const locationLabel = summary.day?.weatherLocation?.trim() || summary.weather?.locationName?.trim() || summary.day?.city || ''

  return (
    <section className="today-summary-card" aria-labelledby="today-summary-title">
      <div className="today-summary-heading">
        <div>
          <p className="eyebrow">TODAY AT A GLANCE</p>
          <h2 id="today-summary-title">{summary.day?.title ?? '今日行程摘要'}</h2>
          <p>{summary.day ? `${summary.day.date} · ${locationLabel}` : '還沒有可用的行程日'}</p>
        </div>
        <CalendarCheck size={24} aria-hidden="true" />
      </div>
      <div className="today-summary-next">
        <div className="today-summary-icon"><ArrowRight size={20} aria-hidden="true" /></div>
        <div>
          <span>下一個活動</span>
          <strong>{summary.nextActivity?.title ?? '今天尚未安排活動'}</strong>
          {summary.nextActivity && <small>{summary.nextActivity.time} · {summary.nextActivity.locationName || summary.nextActivity.address || '地點待補'}</small>}
        </div>
      </div>
      <div className="today-summary-stats">
        <div><CloudSun size={17} aria-hidden="true" /><span>天氣</span><strong>{weatherLabel}</strong></div>
        <div><ListChecks size={17} aria-hidden="true" /><span>活動數</span><strong>{summary.activityCount} 個</strong></div>
        <div><WalletCards size={17} aria-hidden="true" /><span>預算剩餘</span><strong>{formatMoney(summary.remainingBudgetMinor, currency)}</strong></div>
      </div>
    </section>
  )
}
