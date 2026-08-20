import { Plus, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Activity, Trip, TripDay, WeatherSnapshot } from '../../domain/types'
import { TripRepository } from '../../data/repositories/tripRepository'
import { ActivityCard } from './ActivityCard'
import { ActivityForm } from './ActivityForm'
import { DateStrip } from './DateStrip'
import { WeatherCard } from './WeatherCard'
import { getCachedOrFetchWeather } from '../../integrations/weather/weatherRepository'

const repository = new TripRepository()
const starterTrip: Trip = { id: 'trip-seoul-demo', title: '首爾小旅行', destination: '首爾', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 5000000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true }

function makeDays(trip: Trip): TripDay[] {
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(`${trip.startDate}T00:00:00`)
    date.setDate(date.getDate() + index)
    const iso = date.toISOString().slice(0, 10)
    return { id: `${trip.id}-day-${index + 1}`, tripId: trip.id, date: iso, city: index < 3 ? '首爾' : '弘大', title: `Day ${index + 1} 首爾探索`, summary: index === 0 ? '抵達與韓屋散步' : '把喜歡的地方排進今天', accommodation: 'Hanok Stay Seoul', illustrationId: index % 2 ? 'korean-house' : 'hanbok-woman' }
  })
}

export function ItineraryPage() {
  const [trip, setTrip] = useState<Trip>()
  const [days, setDays] = useState<TripDay[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [weather, setWeather] = useState<WeatherSnapshot & { isStale?: boolean; updatedAt?: string }>()
  const [loading, setLoading] = useState(true)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const selectedDay = useMemo(() => days.find((day) => day.date === selectedDate), [days, selectedDate])

  const loadWeather = useCallback(async (currentTrip: Trip, date: string) => {
    setWeatherLoading(true)
    try { setWeather(await getCachedOrFetchWeather(currentTrip.id, date, currentTrip.destination)) } catch { setWeather(undefined) } finally { setWeatherLoading(false) }
  }, [])

  const loadActivities = useCallback(async (dayId: string) => setActivities(await repository.listActivities(dayId)), [])

  useEffect(() => {
    void (async () => {
      let currentTrip = await repository.getActiveTrip()
      if (!currentTrip) { currentTrip = starterTrip; await repository.saveTrip(currentTrip) }
      let currentDays = await repository.listDays(currentTrip.id)
      if (currentDays.length === 0) { currentDays = makeDays(currentTrip); await Promise.all(currentDays.map((day) => repository.saveDay(day))) }
      setTrip(currentTrip); setDays(currentDays); setSelectedDate(currentDays[0].date); setLoading(false)
    })()
  }, [])

  useEffect(() => { if (selectedDay && trip) { void loadActivities(selectedDay.id); void loadWeather(trip, selectedDay.date) } }, [loadActivities, loadWeather, selectedDay, trip])

  const saveActivity = async (activity: Activity) => { await repository.saveActivity(activity); setShowForm(false); await loadActivities(activity.dayId) }
  const deleteActivity = async (id: string) => { await repository.deleteActivity(id); if (selectedDay) await loadActivities(selectedDay.id) }

  if (loading || !trip || !selectedDay) return <section className="page-preview"><p>載入你的旅程中…</p></section>
  return <section className="itinerary-page">
    <header className="page-header"><div><p className="eyebrow">{trip.destination.toUpperCase()} TRIP</p><h1>{trip.title}</h1><p>{trip.startDate} — {trip.endDate}</p></div><button className="header-icon-button" type="button" aria-label="旅程裝扮"><Sparkles size={21} /></button></header>
    <DateStrip days={days} selectedDate={selectedDate} onSelect={setSelectedDate} />
    <WeatherCard weather={weather} loading={weatherLoading} onRefresh={() => void loadWeather(trip, selectedDay.date)} />
    <section className="day-card"><div className="day-card-heading"><div><span className="day-kicker">{new Date(`${selectedDay.date}T00:00:00`).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}</span><h2>{selectedDay.title}</h2><p>{selectedDay.summary}</p></div><span className="day-illustration" aria-hidden="true">{selectedDay.illustrationId === 'korean-house' ? '🏠' : '👘'}</span></div><div className="activity-list">{activities.length ? activities.map((activity) => <ActivityCard key={activity.id} activity={activity} onDelete={deleteActivity} />) : <div className="empty-activities">今天還沒有安排，從一個喜歡的地方開始吧。</div>}</div><button className="add-activity-button" type="button" onClick={() => setShowForm(true)}><Plus size={18} />新增活動</button></section>
    {showForm && <ActivityForm tripId={trip.id} dayId={selectedDay.id} date={selectedDay.date} onSave={saveActivity} onCancel={() => setShowForm(false)} />}
  </section>
}
