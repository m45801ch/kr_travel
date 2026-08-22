import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { IllustrationPicker } from './IllustrationPicker'

function Harness() {
  const [value, setValue] = useState('streetwear-man')
  return <IllustrationPicker value={value} onChange={setValue} />
}

describe('IllustrationPicker', () => {
  it('selects hanbok and supports reset', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: '韓服女生' }))
    expect(screen.getAllByText('韓服女生').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: '重設' }))
    expect(screen.getAllByText('韓服女生').length).toBeGreaterThan(0)
  })

  it('filters by category', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('tab', { name: '服裝' }))
    expect(screen.getByRole('button', { name: '街頭女生' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '韓屋' })).not.toBeInTheDocument()
  })
})
