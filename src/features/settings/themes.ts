import type { AppThemeId, Settings } from '../../domain/types'

export type ThemeDefinition = {
  id: AppThemeId
  name: string
  description: string
  accent: string
  preview: string[]
}

export const themeCatalog: ThemeDefinition[] = [
  {
    id: 'classic',
    name: '櫻花奶油',
    description: '保留目前的溫柔櫻花與奶油色調。',
    accent: '#ef8490',
    preview: ['#fffaf0', '#ef8490', '#78bda7'],
  },
  {
    id: 'forest',
    name: '森林散步',
    description: '以森林、木屋與葉片為靈感的自然系配色。',
    accent: '#5e9f78',
    preview: ['#eef6e7', '#5e9f78', '#c9945a'],
  },
  {
    id: 'storybook',
    name: '晴空冒險',
    description: '天空藍與雲朵白的夏日晴天，搭配明亮的陽光色點綴。',
    accent: '#4b9ed8',
    preview: ['#f7fcff', '#4b9ed8', '#f6c759'],
  },
  {
    id: 'cyberpunk',
    name: '霓虹夜行',
    description: '深色城市夜景搭配電光青與桃紅霓虹。',
    accent: '#ff4f9a',
    preview: ['#111827', '#ff4f9a', '#3de5d0'],
  },
]

export function getThemeDefinition(id?: AppThemeId) {
  return themeCatalog.find((theme) => theme.id === id) ?? themeCatalog[0]
}

export function applyTheme(settings: Pick<Settings, 'themeColor' | 'themeId' | 'fontScale' | 'darkMode'>) {
  const theme = getThemeDefinition(settings.themeId)
  document.documentElement.style.setProperty('--color-accent', settings.themeColor || theme.accent)
  document.documentElement.style.fontSize = `${settings.fontScale}rem`
  document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light'
  document.documentElement.dataset.appTheme = theme.id
}
