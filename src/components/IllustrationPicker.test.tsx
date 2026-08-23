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
  it('uses the supplied default category', () => {
    render(<IllustrationPicker value="namsan-tower" onChange={() => {}} defaultCategory="景點" />)
    expect(screen.getByRole('tab', { name: '景點' })).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps the illustration browser collapsed by default', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const browser = screen.getByText('瀏覽其他圖案').closest('details')
    expect(browser).not.toBeNull()
    expect(browser).not.toHaveAttribute('open')
    expect(screen.getByRole('tab', { name: '服裝' })).not.toBeVisible()

    await user.click(screen.getByText('瀏覽其他圖案'))
    expect(browser).toHaveAttribute('open')
    expect(screen.getByRole('tab', { name: '服裝' })).toBeVisible()
  })

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
