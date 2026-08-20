import { Plus } from 'lucide-react'

export function FloatingAddButton({ label }: { label: string }) {
  return (
    <button className="floating-add" type="button" aria-label={label}>
      <Plus aria-hidden="true" size={24} strokeWidth={2.4} />
      <span>{label}</span>
    </button>
  )
}
