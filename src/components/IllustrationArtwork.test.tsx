import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getIllustration } from '../assets/illustrations'
import { IllustrationArtwork } from './IllustrationArtwork'

describe('IllustrationArtwork', () => {
  it('renders the selected illustration image when one is available', () => {
    render(<IllustrationArtwork illustration={getIllustration('namsan-tower')} alt="南山塔" />)

    expect(screen.getByRole('img', { name: '南山塔' })).toHaveAttribute('src', expect.stringContaining('namsan-tower'))
  })

  it('falls back to the illustration emoji when no image is available', () => {
    render(<IllustrationArtwork illustration={getIllustration('hanbok-woman')} />)

    expect(screen.getByText('👘')).toBeInTheDocument()
  })
})
