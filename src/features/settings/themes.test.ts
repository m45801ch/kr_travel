import { describe, expect, it } from 'vitest'
import { applyTheme, getThemeDefinition, themeCatalog } from './themes'

describe('app themes', () => {
  it('provides the classic palette and three original style themes', () => {
    expect(themeCatalog.map((theme) => theme.id)).toEqual(['classic', 'forest', 'storybook', 'cyberpunk'])
    expect(getThemeDefinition('forest').name).toBe('森林散步')
    expect(getThemeDefinition('storybook').name).toBe('彩色冒險')
    expect(getThemeDefinition('cyberpunk').name).toBe('霓虹夜行')
  })

  it('applies theme metadata and user-selected accent to the document', () => {
    applyTheme({ themeId: 'cyberpunk', themeColor: '#3de5d0', fontScale: 1.1, darkMode: true })

    expect(document.documentElement.dataset.appTheme).toBe('cyberpunk')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#3de5d0')
    expect(document.documentElement.style.fontSize).toBe('1.1rem')
  })
})
