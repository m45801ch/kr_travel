import type { Expense, ExpenseSplit, Member } from './types'

export interface SplitParticipant { memberId: string; amountMinor?: number; percentage?: number }
export interface Settlement { fromMemberId: string; toMemberId: string; amountMinor: number }

export function splitExpense(expense: Expense, participants: SplitParticipant[]): ExpenseSplit[] {
  if (!participants.length) throw new Error('至少選擇一位分攤旅伴')
  const total = expense.baseAmountMinor
  let amounts: number[]
  if (expense.splitMode === 'custom') {
    amounts = participants.map((participant) => participant.amountMinor ?? Math.round(total * (participant.percentage ?? 0) / 100))
    if (amounts.some((amount) => amount < 0) || amounts.reduce((sum, amount) => sum + amount, 0) !== total) throw new Error('自訂分帳金額必須等於支出總額')
  } else {
    const each = Math.floor(total / participants.length)
    const remainder = total - each * participants.length
    amounts = participants.map((_, index) => each + (index < remainder ? 1 : 0))
  }
  return participants.map((participant, index) => ({ id: `${expense.id}-split-${participant.memberId}`, expenseId: expense.id, tripId: expense.tripId, memberId: participant.memberId, amountMinor: amounts[index], percentage: total ? amounts[index] / total * 100 : 0, settled: participant.memberId === expense.payerId }))
}

export function calculateSettlement(expenses: Expense[], members: Member[], splits: ExpenseSplit[]): Settlement[] {
  const paid = new Map(members.map((member) => [member.id, 0]))
  const owed = new Map(members.map((member) => [member.id, 0]))
  expenses.forEach((expense) => paid.set(expense.payerId, (paid.get(expense.payerId) ?? 0) + expense.baseAmountMinor))
  splits.filter((split) => !split.settled).forEach((split) => owed.set(split.memberId, (owed.get(split.memberId) ?? 0) + split.amountMinor))
  const creditors = [...paid.keys()].map((id) => ({ id, amount: (paid.get(id) ?? 0) - (owed.get(id) ?? 0) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount)
  const debtors = [...paid.keys()].map((id) => ({ id, amount: (paid.get(id) ?? 0) - (owed.get(id) ?? 0) })).filter((item) => item.amount < 0).map((item) => ({ id: item.id, amount: -item.amount })).sort((a, b) => b.amount - a.amount)
  const settlements: Settlement[] = []
  debtors.forEach((debtor) => creditors.forEach((creditor) => {
    if (debtor.amount <= 0 || creditor.amount <= 0) return
    const amount = Math.min(debtor.amount, creditor.amount)
    settlements.push({ fromMemberId: debtor.id, toMemberId: creditor.id, amountMinor: amount })
    debtor.amount -= amount; creditor.amount -= amount
  }))
  return settlements
}
