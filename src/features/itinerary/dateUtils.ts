export function addDays(dateIso: string, delta: number): string {
  const [year, month, day] = dateIso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + delta)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value) => String(value).padStart(2, '0'))
    .join('-')
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function findTimeConflictIds(activities: Array<{ id: string; time: string }>): Set<string> {
  const grouped = new Map<string, string[]>()
  for (const activity of activities) {
    if (!activity.time) continue
    grouped.set(activity.time, [...(grouped.get(activity.time) ?? []), activity.id])
  }
  return new Set(Array.from(grouped.values()).filter((ids) => ids.length > 1).flat())
}
