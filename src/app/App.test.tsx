import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('app shell', () => {
  it('renders the five primary navigation labels', () => {
    render(<App />)

    expect(screen.getByText('行程')).toBeInTheDocument()
    expect(screen.getByText('記帳')).toBeInTheDocument()
    expect(screen.getByText('購物')).toBeInTheDocument()
    expect(screen.getByText('準備')).toBeInTheDocument()
    expect(screen.getByText('設置')).toBeInTheDocument()
  })
})
