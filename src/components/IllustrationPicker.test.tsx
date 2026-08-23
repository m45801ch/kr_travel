import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { db } from '../data/db'
import { IllustrationPicker } from './IllustrationPicker'

function Harness() {
  const [value, setValue] = useState('streetwear-man')
  return <IllustrationPicker value={value} onChange={setValue} />
}

afterEach(async () => {
  await db.illustrationPreferences.clear()
})

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

  it('searches illustrations by label', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('瀏覽其他圖案'))
    await user.type(screen.getByRole('textbox', { name: '搜尋圖案' }), '北京故宮')

    expect(screen.getByRole('button', { name: '北京故宮' })).toBeVisible()
    expect(screen.queryByRole('button', { name: '首爾塔' })).not.toBeInTheDocument()
  })

  it('adds and removes an illustration from favorites', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('瀏覽其他圖案'))
    await user.click(screen.getByRole('button', { name: '加入最愛：韓服女生' }))

    await waitFor(() => expect(screen.getAllByRole('button', { name: '取消最愛：韓服女生' }).length).toBeGreaterThan(0))
    expect(screen.getByRole('region', { name: '我的最愛' })).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: '取消最愛：韓服女生' })[0])
    await waitFor(() => expect(screen.queryByRole('region', { name: '我的最愛' })).not.toBeInTheDocument())
  })

  it('records selected illustrations in recent usage', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('瀏覽其他圖案'))
    await user.click(screen.getByRole('button', { name: '韓服女生' }))

    await waitFor(() => expect(screen.getByRole('region', { name: '最近使用' })).toBeInTheDocument())
    expect(screen.getAllByRole('button', { name: '韓服女生' }).length).toBeGreaterThan(1)
  })
})
