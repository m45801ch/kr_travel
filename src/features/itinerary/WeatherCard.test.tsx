import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WeatherCard } from './WeatherCard'

describe('WeatherCard', () => {
  it('keeps the location picker collapsed until opened, then saves a selected city', async () => {
    const user = userEvent.setup()
    const onSaveLocation = vi.fn()

    render(
      <WeatherCard
        loading={false}
        location="首爾"
        countryCode="KR"
        cityQuery="Seoul"
        onSaveLocation={onSaveLocation}
        onRefresh={vi.fn()}
      />,
    )

    expect(screen.queryByRole('textbox', { name: '搜尋國家城市的天氣地點' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    expect(screen.getByRole('textbox', { name: '搜尋國家城市的天氣地點' })).toBeInTheDocument()

    const countrySearch = screen.getByRole('textbox', { name: '搜尋國家城市的天氣地點' })
    await user.type(countrySearch, '日本')
    expect(screen.getByRole('option', { name: '日本' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '韓國' })).not.toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: '選擇國家' }), 'JP')
    const citySearch = screen.getByRole('textbox', { name: '搜尋城市（中文）' })
    await user.type(citySearch, '東京')
    expect(screen.getByRole('option', { name: '東京' })).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: '選擇城市' }), 'Tokyo')
    await user.click(screen.getByRole('button', { name: '更新天氣地點' }))

    expect(onSaveLocation).toHaveBeenCalledWith({ location: '東京', countryCode: 'JP', cityQuery: 'Tokyo' })
  })
})
