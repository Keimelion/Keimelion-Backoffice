import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { renderWithIntl } from '@/test/test-utils'

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')

const { LocalePicker } = await import('./locale-picker')
const { useLocaleStore } = await import('@/lib/i18n/locale-store')
const { apiClient } = await import('@/data-access/_shared/client')

let mock: ApiMock

beforeEach(() => {
  useLocaleStore.setState({ locale: 'en' })
  mock = createApiMock()
})

afterEach(() => {
  mock.restore()
})

describe('LocalePicker', () => {
  it('renders the current locale label', () => {
    renderWithIntl(<LocalePicker />)
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
  })

  it('shows only non-active locales in the dropdown', async () => {
    const user = userEvent.setup()
    renderWithIntl(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByRole('menuitem', { name: /Français/ })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /English/ })).not.toBeInTheDocument()
  })

  it('updates the store when a locale is selected', async () => {
    const user = userEvent.setup()
    renderWithIntl(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    await user.click(screen.getByText(/Français/))
    expect(useLocaleStore.getState().locale).toBe('fr')
  })

  it('propagates the selected locale to the SDK Accept-Language header', async () => {
    const user = userEvent.setup()
    mock.onGet('/occasion-types').reply(200, [])

    renderWithIntl(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    await user.click(screen.getByText(/Français/))

    await apiClient.occasionTypes.list()

    expect(mock.history.get[0]?.headers['accept-language']).toBe('fr')
  })
})
