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
    render(<ListItemCard item={{ id: 'item-1', tripId: 'trip-1', type: 'prep', name: '護照', category: '證件', note: '', priority: 'important', location: '', illustrationId: 'airport-travel', completed: false, order: 0 }} onToggle={onToggle} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '完成 護照' }))
    expect(onToggle).toHaveBeenCalledWith('item-1')
  })
})
