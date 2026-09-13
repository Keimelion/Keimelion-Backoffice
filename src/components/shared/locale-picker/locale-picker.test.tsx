import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')

const { LocalePicker } = await import('./locale-picker')
const { useLocaleStore } = await import('@/lib/i18n/locale-store')
const { axiosInstance } = await import('@/data-access/_shared/axios')

let mock: MockAdapter

beforeEach(() => {
  useLocaleStore.setState({ locale: 'en' })
  mock = new MockAdapter(axiosInstance)
})

afterEach(() => {
  mock.restore()
})

describe('LocalePicker', () => {
  it('renders the current locale label', () => {
    render(<LocalePicker />)
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
  })

  it('opens dropdown with all locale options', async () => {
    const user = userEvent.setup()
    render(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByText(/Français/)).toBeInTheDocument()
  })

  it('updates the store when a locale is selected', async () => {
    const user = userEvent.setup()
    render(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    await user.click(screen.getByText(/Français/))
    expect(useLocaleStore.getState().locale).toBe('fr')
  })

  it('propagates the selected locale to the axios Accept-Language header', async () => {
    const user = userEvent.setup()
    mock.onGet('/occasion-types').reply(200, [])

    render(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    await user.click(screen.getByText(/Français/))

    await axiosInstance.get('/occasion-types')

    expect(mock.history.get[0]?.headers?.['Accept-Language']).toBe('fr')
  })
})
