export function ProgressSummary({ total, completed }: { total: number; completed: number }) {
  const percentage = total ? Math.round(completed / total * 100) : 0
  return <section className="list-progress"><div><strong>{completed}</strong><span>已完成</span></div><div><strong>{Math.max(total - completed, 0)}</strong><span>待完成</span></div><div className="progress-ring" style={{ '--progress': `${percentage}%` } as React.CSSProperties}><strong>{percentage}%</strong></div></section>
}
