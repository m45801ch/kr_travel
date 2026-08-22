import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OfflineStatus } from './OfflineStatus'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('OfflineStatus', () => {
  it('shows an offline message and returns to normal after reconnecting', () => {
    render(<OfflineStatus />)

    fireEvent(window, new Event('offline'))
    expect(screen.getByRole('status')).toHaveTextContent('目前離線，資料仍可在本機使用')

    fireEvent(window, new Event('online'))
    expect(screen.getByRole('status')).toHaveTextContent('已恢復連線')
  })
})
