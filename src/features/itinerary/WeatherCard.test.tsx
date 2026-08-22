import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WeatherCard } from './WeatherCard'

describe('WeatherCard', () => {
  afterEach(() => vi.restoreAllMocks())
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

    expect(screen.queryByRole('textbox', { name: '搜尋國家或城市' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    expect(screen.getByRole('textbox', { name: '搜尋國家或城市' })).toBeInTheDocument()

    const countrySearch = screen.getByRole('textbox', { name: '搜尋國家或城市' })
    await user.type(countrySearch, '日本')
    expect(screen.getByRole('button', { name: '日本' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '日本' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '韓國' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '日本' }))
    expect(screen.getByRole('combobox', { name: '選擇國家' })).toHaveValue('JP')
    await user.selectOptions(screen.getByRole('combobox', { name: '選擇城市' }), '東京')
    await user.click(screen.getByRole('button', { name: '更新天氣地點' }))

    expect(onSaveLocation).toHaveBeenCalledWith({ location: '東京', countryCode: 'JP', cityQuery: 'Tokyo' })
  })

  it('matches cities from the primary search and backfills the country when a city result is picked', async () => {
    const user = userEvent.setup()
    const onSaveLocation = vi.fn()

    render(
      <WeatherCard
        loading={false}
        location="首爾"
        onSaveLocation={onSaveLocation}
        onRefresh={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    const search = screen.getByRole('textbox', { name: '搜尋國家或城市' })
    await user.type(search, '東京')

    const tokyoResult = screen.getByRole('button', { name: '東京（日本）' })
    expect(tokyoResult).toBeInTheDocument()
    await user.click(tokyoResult)

    expect(screen.getByRole('combobox', { name: '選擇國家' })).toHaveValue('JP')
    expect(screen.getByRole('combobox', { name: '選擇城市' })).toHaveValue('東京')

    await user.click(screen.getByRole('button', { name: '更新天氣地點' }))
    expect(onSaveLocation).toHaveBeenCalledWith({ location: '東京', countryCode: 'JP', cityQuery: 'Tokyo' })
  })

  it('matches keywords across country and city names and lets a country result fill the country', async () => {
    const user = userEvent.setup()
    const onSaveLocation = vi.fn()

    render(
      <WeatherCard
        loading={false}
        location="首爾"
        onSaveLocation={onSaveLocation}
        onRefresh={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    const search = screen.getByRole('textbox', { name: '搜尋國家或城市' })
    await user.type(search, '泰')
    expect(screen.getByRole('button', { name: '泰國' })).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, '曼谷')
    const bangkokResult = screen.getByRole('button', { name: '曼谷（泰國）' })
    expect(bangkokResult).toBeInTheDocument()

    await user.click(bangkokResult)
    expect(screen.getByRole('combobox', { name: '選擇國家' })).toHaveValue('TH')
    expect(screen.getByRole('combobox', { name: '選擇城市' })).toHaveValue('曼谷')
    expect(onSaveLocation).not.toHaveBeenCalled()
  })

  it('renders only the selected country cities without ghost options from the previous country', async () => {
    const user = userEvent.setup()

    render(
      <WeatherCard
        loading={false}
        location="首爾"
        countryCode="KR"
        cityQuery="Seoul"
        onSaveLocation={vi.fn()}
        onRefresh={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    expect(screen.getByRole('combobox', { name: '選擇城市' })).toHaveValue('首爾')

    await user.selectOptions(screen.getByRole('combobox', { name: '選擇國家' }), 'CN')
    const cityNames = (await screen.findAllByRole('option', { name: /北京|上海|廣州|首爾|明洞|弘大|江南|釜山|濟州/ })).map((option) => option.textContent)
    expect(cityNames).toEqual(['北京', '上海', '廣州'])
  })

  it('saves the exact picked city even when several cities share the same weather query', async () => {
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

    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    await user.selectOptions(screen.getByRole('combobox', { name: '選擇城市' }), '明洞')
    await user.click(screen.getByRole('button', { name: '更新天氣地點' }))

    expect(onSaveLocation).toHaveBeenCalledWith({ location: '明洞', countryCode: 'KR', cityQuery: 'Seoul' })
  })

  it('lets an online hit fill country and save a city not in the offline list (e.g. 珠海)', async () => {
    const user = userEvent.setup()
    const onSaveLocation = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ place_id: 999999, display_name: '珠海, 中國', lat: '22.234', lon: '113.543', address: { country_code: 'cn', country: '中國', city: '珠海' } }],
      }),
    )

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

    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    await user.type(screen.getByRole('textbox', { name: '搜尋國家或城市' }), '珠海')
    await waitFor(() => expect(screen.getByRole('button', { name: '珠海（中國）' })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '珠海（中國）' }))
    expect(screen.getByRole('combobox', { name: '選擇國家' })).toHaveValue('CN')
    expect(screen.getByRole('combobox', { name: '選擇城市' })).toHaveValue('珠海')

    await user.click(screen.getByRole('button', { name: '更新天氣地點' }))
    expect(onSaveLocation).toHaveBeenCalledWith(expect.objectContaining({ location: '珠海', countryCode: 'CN', cityQuery: '珠海' }))
  })

  it('normalizes 臺/台 so typing 臺北 finds 台北（台灣）', async () => {
    const user = userEvent.setup()

    render(
      <WeatherCard
        loading={false}
        location="首爾"
        onSaveLocation={vi.fn()}
        onRefresh={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    await user.type(screen.getByRole('textbox', { name: '搜尋國家或城市' }), '臺北')
    expect(screen.getByRole('button', { name: '台北（台灣）' })).toBeInTheDocument()
  })

  it('syncs country and city selects when the location prop changes to 台北', async () => {
    const { rerender } = render(
      <WeatherCard
        loading={false}
        location="首爾"
        countryCode="KR"
        cityQuery="Seoul"
        onSaveLocation={vi.fn()}
        onRefresh={vi.fn()}
      />,
    )

    await userEvent.setup().click(screen.getByRole('button', { name: '搜尋國家城市的天氣地點' }))
    expect(screen.getByRole('combobox', { name: '選擇國家' })).toHaveValue('KR')
    expect(screen.getByRole('combobox', { name: '選擇城市' })).toHaveValue('首爾')

    rerender(
      <WeatherCard
        loading={false}
        location="台北"
        countryCode="TW"
        cityQuery="Taipei"
        onSaveLocation={vi.fn()}
        onRefresh={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox', { name: '選擇國家' })).toHaveValue('TW')
    expect(screen.getByRole('combobox', { name: '選擇城市' })).toHaveValue('台北')
  })
})
