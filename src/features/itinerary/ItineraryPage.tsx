import { CalendarDays, Pencil, Plus, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Activity, Trip, TripDay, WeatherSnapshot } from '../../domain/types'
import { TripRepository } from '../../data/repositories/tripRepository'
import { ActivityCard } from './ActivityCard'
import { ActivityForm } from './ActivityForm'
import { DateStrip } from './DateStrip'
import { WeatherCard } from './WeatherCard'
import { getCachedOrFetchWeather } from '../../integrations/weather/weatherRepository'
import { addDays, isIsoDate } from './dateUtils'

const repository = new TripRepository()
const starterTrip: Trip = { id: 'trip-seoul-demo', title: '首爾小旅行', destination: '首爾', startDate: '2026-08-25', endDate: '2026-08-29', baseCurrency: 'TWD', budgetMinor: 5000000, illustrationId: 'hanbok-woman', themeColor: '#ef8490', active: true }

function makeDays(trip: Trip): TripDay[] {
  const dayCount = Math.max(1, Math.round((new Date(`${trip.endDate}T00:00:00`).getTime() - new Date(`${trip.startDate}T00:00:00`).getTime()) / 86400000) + 1)
  return Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(trip.startDate, index)
    return { id: `${trip.id}-day-${index + 1}`, tripId: trip.id, date, city: index < 3 ? '首爾' : '弘大', title: index === 0 ? 'Day 1 抵達' : `Day ${index + 1} 探索`, summary: index === 0 ? '抵達與韓屋散步' : '把喜歡的地方排進今天', accommodation: 'Hanok Stay Seoul', illustrationId: index % 2 ? 'korean-house' : 'hanbok-woman' }
  })
}

export function ItineraryPage() {
  const [trip, setTrip] = useState<Trip>()
  const [days, setDays] = useState<TripDay[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [weather, setWeather] = useState<WeatherSnapshot & { isStale?: boolean; updatedAt?: string }>()
  const [weatherError, setWeatherError] = useState('')
  const [loading, setLoading] = useState(true)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity>()
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDates, setEditingDates] = useState(false)
  const [selectedDateBeforeDateEdit, setSelectedDateBeforeDateEdit] = useState('')
  const [editingDay, setEditingDay] = useState<TripDay>()
  const [titleDraft, setTitleDraft] = useState('')
  const [startDateDraft, setStartDateDraft] = useState('')
  const [endDateDraft, setEndDateDraft] = useState('')
  const [dayTitleDraft, setDayTitleDraft] = useState('')
  const visibleDays = useMemo(() => {
    if (!editingDates || !trip || !isIsoDate(startDateDraft) || !isIsoDate(endDateDraft)) return days
    if (new Date(`${endDateDraft}T00:00:00`) < new Date(`${startDateDraft}T00:00:00`)) return days
    const previewTrip = { ...trip, startDate: startDateDraft, endDate: endDateDraft }
    return makeDays(previewTrip).map((day) => {
      const existingDay = days.find((current) => current.id === day.id)
      return existingDay ? { ...existingDay, date: day.date } : day
    })
  }, [days, editingDates, endDateDraft, startDateDraft, trip])
  const visibleSelectedDate = useMemo(() => visibleDays.some((day) => day.date === selectedDate) ? selectedDate : (visibleDays[0]?.date ?? selectedDate), [selectedDate, visibleDays])
  const selectedDay = useMemo(() => visibleDays.find((day) => day.date === visibleSelectedDate), [visibleDays, visibleSelectedDate])

  const loadWeather = useCallback(async (currentTrip: Trip, date: string, destination: string) => {
    setWeatherLoading(true)
    setWeatherError('')
    try {
      setWeather(await getCachedOrFetchWeather(currentTrip.id, date, destination))
    } catch (error) {
      setWeather(undefined)
      setWeatherError(error instanceof Error ? error.message : '天氣資料載入失敗，請稍後再試。')
    } finally {
      setWeatherLoading(false)
    }
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

  const selectedWeatherLocation = selectedDay?.weatherLocation?.trim() || selectedDay?.city?.trim() || trip?.destination || ''
  const selectedWeatherQuery = selectedDay?.weatherCityQuery?.trim() || selectedWeatherLocation

  useEffect(() => { if (selectedDay && trip) { void loadActivities(selectedDay.id); void loadWeather(trip, selectedDay.date, selectedWeatherQuery) } }, [loadActivities, loadWeather, selectedDay, selectedWeatherQuery, trip])

  const saveWeatherLocation = async (selection: { location: string; countryCode: string; cityQuery: string }) => {
    if (!selectedDay || !trip) return
    const nextDay = { ...selectedDay, weatherLocation: selection.location, weatherCountryCode: selection.countryCode, weatherCityQuery: selection.cityQuery }
    await repository.saveDay(nextDay)
    setDays((current) => current.map((day) => (day.id === nextDay.id ? nextDay : day)))
    await loadWeather(trip, nextDay.date, selection.cityQuery)
  }

  const saveActivity = async (activity: Activity) => { await repository.saveActivity(activity); setShowForm(false); setEditingActivity(undefined); await loadActivities(activity.dayId) }
  const deleteActivity = async (id: string) => { await repository.deleteActivity(id); if (selectedDay) await loadActivities(selectedDay.id) }

  const startEditTitle = () => { if (trip) { setTitleDraft(trip.title); setEditingTitle(true) } }
  const saveTitle = async () => {
    if (!trip) return
    const next = { ...trip, title: titleDraft.trim() || trip.title }
    await repository.saveTrip(next); setTrip(next); setEditingTitle(false)
  }

  const startEditDates = () => {
    if (!trip) return
    setSelectedDateBeforeDateEdit(selectedDate)
    setStartDateDraft(trip.startDate)
    setEndDateDraft(trip.endDate)
    setEditingDates(true)
  }
  const cancelDateEdit = () => {
    setEditingDates(false)
    setSelectedDate(selectedDateBeforeDateEdit || days[0]?.date || '')
  }
  const saveDates = async () => {
    if (!trip) return
    const sanitize = (value: string, fallback: string) => (isIsoDate(value) ? value : fallback)
    const start = sanitize(startDateDraft, trip.startDate)
    const end = sanitize(endDateDraft, trip.endDate)
    if (new Date(`${end}T00:00:00`) < new Date(`${start}T00:00:00`)) return
    const next = { ...trip, startDate: start, endDate: end }
    await repository.saveTrip(next)
    // 依新日期範圍重建天次：保留既有天次內容，並清除範圍外的天次與活動。
    const nextDays = makeDays(next)
    const nextDayIds = new Set(nextDays.map((day) => day.id))
    for (const day of days) {
      await repository.deleteActivitiesByDay(day.id)
      if (!nextDayIds.has(day.id)) await repository.deleteDay(day.id)
    }
    await Promise.all(nextDays.map((day) => {
      const existingDay = days.find((current) => current.id === day.id)
      return repository.saveDay(existingDay ? { ...existingDay, tripId: next.id, date: day.date } : day)
    }))
    const refreshed = await repository.listDays(next.id)
    setTrip(next); setDays(refreshed); setSelectedDate(refreshed[0]?.date ?? start); setEditingDates(false)
  }

  const startEditDay = (day: TripDay) => { setDayTitleDraft(day.title); setEditingDay(day) }
  const saveDayTitle = async () => {
    if (!editingDay) return
    const next = { ...editingDay, title: dayTitleDraft.trim() || editingDay.title }
    await repository.saveDay(next)
    setDays((current) => current.map((day) => (day.id === next.id ? next : day)))
    setEditingDay(undefined)
  }

  if (loading || !trip || !selectedDay) return <section className="page-preview"><p>載入你的旅程中…</p></section>
  return <section className="itinerary-page">
    <header className="page-header">
      <div className="trip-heading">
        <p className="eyebrow">{trip.destination.toUpperCase()} TRIP</p>
        {editingTitle
          ? <div className="inline-edit"><input className="inline-edit-input" value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void saveTitle(); if (event.key === 'Escape') setEditingTitle(false) }} autoFocus onBlur={() => void saveTitle()} aria-label="行程標題" /><button type="button" className="inline-edit-ok" onClick={() => void saveTitle()}>完成</button></div>
          : <h1 className="editable" role="button" tabIndex={0} onClick={startEditTitle} onKeyDown={(event) => { if (event.key === 'Enter') startEditTitle() }} aria-label="點擊編輯行程標題">{trip.title} <Pencil size={16} aria-hidden="true" /></h1>}
        {editingDates
          ? <div className="inline-edit date-inline-edit">
              <input type="date" className="inline-edit-input" value={startDateDraft} onChange={(event) => setStartDateDraft(event.target.value)} aria-label="開始日期" />
              <span className="date-separator">—</span>
              <input type="date" className="inline-edit-input" value={endDateDraft} min={startDateDraft} onChange={(event) => setEndDateDraft(event.target.value)} aria-label="結束日期" />
              <button type="button" className="inline-edit-ok" onClick={() => void saveDates()}>完成</button>
              <button type="button" className="inline-edit-cancel" onClick={cancelDateEdit}>取消</button>
            </div>
          : <p className="editable-date" role="button" tabIndex={0} onClick={startEditDates} onKeyDown={(event) => { if (event.key === 'Enter') startEditDates() }} aria-label="點擊修改行程日期"><CalendarDays size={15} aria-hidden="true" />{trip.startDate} — {trip.endDate} <Pencil size={14} aria-hidden="true" /></p>}
      </div>
      <button className="header-icon-button" type="button" aria-label="旅程裝扮"><Sparkles size={21} /></button>
    </header>
    <DateStrip days={visibleDays} selectedDate={visibleSelectedDate} onSelect={setSelectedDate} />
    <WeatherCard key={selectedDay.id} weather={weather} error={weatherError} loading={weatherLoading} location={selectedWeatherLocation} countryCode={selectedDay.weatherCountryCode} cityQuery={selectedDay.weatherCityQuery} onSaveLocation={(selection) => void saveWeatherLocation(selection)} onRefresh={() => void loadWeather(trip, selectedDay.date, selectedWeatherQuery)} />
    <section className="day-card">
      <div className="day-card-heading">
        {editingDay && editingDay.id === selectedDay.id
          ? <div className="day-title-edit"><input className="inline-edit-input" value={dayTitleDraft} onChange={(event) => setDayTitleDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void saveDayTitle(); if (event.key === 'Escape') setEditingDay(undefined) }} autoFocus onBlur={() => void saveDayTitle()} aria-label="本日標題" /><button type="button" className="inline-edit-ok" onClick={() => void saveDayTitle()}>完成</button></div>
          : <div className="editable" role="button" tabIndex={0} onClick={() => startEditDay(selectedDay)} onKeyDown={(event) => { if (event.key === 'Enter') startEditDay(selectedDay) }} aria-label="點擊編輯本日標題">
              <div><span className="day-kicker">{new Date(`${selectedDay.date}T00:00:00`).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}</span><h2>{selectedDay.title} <Pencil size={15} aria-hidden="true" /></h2><p>{selectedDay.summary}</p></div>
            </div>}
        <span className="day-illustration" aria-hidden="true">{selectedDay.illustrationId === 'korean-house' ? '🏠' : '👘'}</span>
      </div>
      <div className="activity-list">{activities.length ? activities.map((activity) => <ActivityCard key={activity.id} activity={activity} onDelete={deleteActivity} onEdit={(id) => void (async () => { const found = activities.find((a) => a.id === id); if (found) { setEditingActivity(found); setShowForm(true) } })()} />) : <div className="empty-activities">今天還沒有安排,從一個喜歡的地方開始吧。</div>}</div>
      <button className="add-activity-button" type="button" onClick={() => { setEditingActivity(undefined); setShowForm(true) }}><Plus size={18} />新增活動</button>
    </section>
    {showForm && (
      <ActivityForm
        tripId={trip.id}
        dayId={selectedDay.id}
        date={selectedDay.date}
        initial={editingActivity}
        onSave={saveActivity}
        onCancel={() => { setShowForm(false); setEditingActivity(undefined) }}
      />
    )}
  </section>
}
