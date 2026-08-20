import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ListItem, ListType, Member } from '../../domain/types'
import { ListRepository } from '../../data/repositories/listRepository'
import { MemberRepository } from '../../data/repositories/memberRepository'
import { TripRepository } from '../../data/repositories/tripRepository'
import { ListItemCard } from './ListItemCard'
import { ListItemForm } from './ListItemForm'
import { ProgressSummary } from './ProgressSummary'

const tripRepository = new TripRepository()
const listRepository = new ListRepository()
const memberRepository = new MemberRepository()

export function ListPage({ type }: { type: ListType }) {
  const [trip, setTrip] = useState<Awaited<ReturnType<TripRepository['getActiveTrip']>>>()
  const [members, setMembers] = useState<Member[]>([])
  const [items, setItems] = useState<ListItem[]>([])
  const [filter, setFilter] = useState('全部')
  const [showForm, setShowForm] = useState(false)
  const title = type === 'shopping' ? '購物清單' : '行前準備'
  const subtitle = type === 'shopping' ? '把想帶回家的東西記下來' : '出發前一步一步完成'
  const reload = async () => { const currentTrip = await tripRepository.getActiveTrip(); if (!currentTrip) return; setTrip(currentTrip); setMembers(await memberRepository.listByTrip(currentTrip.id)); setItems(await listRepository.listByTrip(currentTrip.id, type)) }
  useEffect(() => { void reload() }, [type])
  const categories = useMemo(() => ['全部', ...new Set(items.map((item) => item.category))], [items])
  const visible = filter === '全部' ? items : items.filter((item) => item.category === filter)
  const completed = items.filter((item) => item.completed).length
  if (!trip) return <section className="page-preview"><p>請先到行程頁建立旅程。</p></section>
  return <section className="list-page"><header className="page-header"><div><p className="eyebrow">{type === 'shopping' ? 'SHOPPING LIST' : 'BEFORE TRIP'}</p><h1>{title}</h1><p>{subtitle}</p></div><button className="header-add-button" type="button" onClick={() => setShowForm(true)}><Plus size={20} />新增</button></header><ProgressSummary total={items.length} completed={completed} /><div className="list-filter">{categories.map((item) => <button className={filter === item ? 'is-active' : ''} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="list-items">{visible.length ? visible.map((item) => <ListItemCard key={item.id} item={item} onToggle={async (id) => { const target = items.find((item) => item.id === id); if (target) { await listRepository.save({ ...target, completed: !target.completed }); await reload() } }} onDelete={async (id) => { await listRepository.delete(id); await reload() }} />) : <div className="empty-activities">還沒有項目，按下新增開始整理吧。</div>}</div>{showForm && <ListItemForm type={type} tripId={trip.id} members={members} onSave={async (item) => { await listRepository.save(item); setShowForm(false); await reload() }} onCancel={() => setShowForm(false)} />}</section>
}
