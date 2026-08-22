import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ListItemCard } from './ListItemCard'
import { ProgressSummary } from './ProgressSummary'

describe('travel lists', () => {
  it('reports progress', () => {
    render(<ProgressSummary total={5} completed={2} />)
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('toggles an item', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<ListItemCard item={{ id: 'item-1', tripId: 'trip-1', type: 'prep', name: '護照', category: '證件', note: '', priority: 'important', location: '', illustrationId: 'airport-travel', completed: false, order: 0 }} onToggle={onToggle} onEdit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '完成 護照' }))
    expect(onToggle).toHaveBeenCalledWith('item-1')
  })

  it('opens edit form when card is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<ListItemCard item={{ id: 'item-2', tripId: 'trip-1', type: 'shopping', name: '面膜', category: '美妝', note: '', priority: 'normal', location: '', illustrationId: 'shopping-bag', completed: false, order: 0 }} onToggle={vi.fn()} onEdit={onEdit} />)
    await user.click(screen.getByRole('button', { name: '編輯 面膜' }))
    expect(onEdit).toHaveBeenCalledWith('item-2')
  })
})
