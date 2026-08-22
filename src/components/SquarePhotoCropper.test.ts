import { describe, expect, it } from 'vitest'
import { calculateCropSourceRect } from './SquarePhotoCropper'

describe('SquarePhotoCropper crop coordinates', () => {
  it('converts the square preview frame into the matching source-image rectangle', () => {
    expect(calculateCropSourceRect({ width: 1200, height: 800 }, 0.35, 1, { x: 0, y: 0 })).toEqual({ x: 200, y: 0, size: 800 })
  })
})
