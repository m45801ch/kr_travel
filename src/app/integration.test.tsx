import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { APP_VERSION } from './version'

describe('travel app integration', () => {
  it('navigates across the five primary tabs', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByText('首爾小旅行')).toBeInTheDocument())
    await user.click(screen.getByRole('link', { name: '記帳' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: '旅行記帳' })).toBeInTheDocument())
    await user.click(screen.getByRole('link', { name: '購物' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: '購物清單' })).toBeInTheDocument())
    await user.click(screen.getByRole('link', { name: '準備' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: '行前準備' })).toBeInTheDocument())
    await user.click(screen.getByRole('link', { name: '設置' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: '設置' })).toBeInTheDocument())
    expect(screen.getByText(APP_VERSION)).toBeInTheDocument()
  })
})
