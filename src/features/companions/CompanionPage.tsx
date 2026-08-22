import { useEffect, useState } from 'react'
import { Plus, UsersRound } from 'lucide-react'
import type { Member } from '../../domain/types'
import { MemberRepository } from '../../data/repositories/memberRepository'
import { TripRepository } from '../../data/repositories/tripRepository'
import { CompanionCard } from './CompanionCard'
import { CompanionForm } from './CompanionForm'
import { ThemeHeaderArt } from '../../components/ThemeHeaderArt'

const tripRepository = new TripRepository()
const memberRepository = new MemberRepository()

export function CompanionPage() {
  const [trip, setTrip] = useState<Awaited<ReturnType<TripRepository['getActiveTrip']>>>()
  const [members, setMembers] = useState<Member[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingMember, setEditingMember] = useState<Member>()

  const reload = async () => {
    const currentTrip = await tripRepository.getActiveTrip()
    if (!currentTrip) return
    setTrip(currentTrip)
    setMembers(await memberRepository.listCompanionsByTrip(currentTrip.id))
  }

  useEffect(() => {
    void (async () => {
      const currentTrip = await tripRepository.getActiveTrip()
      if (!currentTrip) return
      setTrip(currentTrip)
      setMembers(await memberRepository.listCompanionsByTrip(currentTrip.id))
    })()
  }, [])

  const openAddForm = () => {
    setEditingMember(undefined)
    setIsAdding(true)
  }

  const closeForm = () => {
    setEditingMember(undefined)
    setIsAdding(false)
  }

  if (!trip) {
    return (
      <section className="page-preview">
        <p className="eyebrow">TRAVEL COMPANIONS</p>
        <h1>旅伴</h1>
        <p>請先到行程頁建立旅程，再新增一起出發的旅伴。</p>
      </section>
    )
  }

  return (
    <section className="companion-page">
      <header className="page-header themed-header themed-header-companions">
        <ThemeHeaderArt kind="companions" />
        <div>
          <p className="eyebrow">TRAVEL COMPANIONS</p>
          <h1>旅伴</h1>
          <p>把一起出發的人放在這裡</p>
        </div>
      </header>

      <section className="companion-summary" aria-label="旅伴統計">
        <div className="companion-summary-icon"><UsersRound size={22} aria-hidden="true" /></div>
        <div>
          <strong>{members.length} 位旅伴</strong>
          <span>一起規劃這趟旅程</span>
        </div>
        <span className="companion-summary-trip">{trip.title}</span>
        <button className="header-add-button companion-summary-add" type="button" onClick={openAddForm}>
          <Plus size={18} aria-hidden="true" />新增
        </button>
      </section>

      <div className="companion-list">
        {members.length ? members.map((member) => (
          <CompanionCard key={member.id} member={member} onEdit={(selectedMember) => { setIsAdding(false); setEditingMember(selectedMember) }} />
        )) : (
          <div className="empty-activities companion-empty">
            <span className="companion-empty-emoji" aria-hidden="true">🧳</span>
            <strong>還沒有旅伴</strong>
            <span>新增名字和照片，讓這趟旅程更有專屬感。</span>
            <button className="add-activity-button" type="button" onClick={openAddForm}><Plus size={18} aria-hidden="true" />新增第一位旅伴</button>
          </div>
        )}
      </div>

      {(isAdding || editingMember) && <CompanionForm tripId={trip.id} member={editingMember} onSave={async (member) => { await memberRepository.save(member); closeForm(); await reload() }} onDelete={async (member) => { await memberRepository.delete(member); closeForm(); await reload() }} onCancel={closeForm} />}
    </section>
  )
}
