import type { Member } from '../../domain/types'
import type { Settlement } from '../../domain/splitting'

export function SettlementSummary({ settlements, members, format }: { settlements: Settlement[]; members: Member[]; format: (amount: number) => string }) {
  const name = (id: string) => members.find((member) => member.id === id)?.name ?? id
  return <section className="settlement-card"><h2>分帳結算</h2>{settlements.length ? settlements.map((settlement) => <div className="settlement-row" key={`${settlement.fromMemberId}-${settlement.toMemberId}`}><strong>{name(settlement.fromMemberId)}</strong><span>應付給</span><strong>{name(settlement.toMemberId)}</strong><em>{format(settlement.amountMinor)}</em></div>) : <p>目前沒有需要結算的金額。</p>}</section>
}
