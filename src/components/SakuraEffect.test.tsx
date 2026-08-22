import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SakuraEffect } from './SakuraEffect'

describe('SakuraEffect', () => {
  it('renders a visible set of themed falling particles', () => {
    render(<SakuraEffect />)

    const layer = screen.getByTestId('sakura-effect')
    expect(layer).toHaveClass('sakura-layer')
    expect(layer.querySelectorAll('.sakura-petal')).toHaveLength(32)
  })
})
