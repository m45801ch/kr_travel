import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CompanionForm } from './CompanionForm'

describe('CompanionForm', () => {
  it('opens a square crop preview before accepting an uploaded avatar', async () => {
    const user = userEvent.setup()
    render(<CompanionForm tripId="trip-1" onSave={vi.fn()} onCancel={vi.fn()} />)

    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/上傳旅伴圖片/), file)

    expect(screen.getByRole('dialog', { name: '調整旅伴大頭貼' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '確認裁切' })).toBeInTheDocument()
    expect(screen.getByLabelText('縮放')).toBeInTheDocument()
  })
})
