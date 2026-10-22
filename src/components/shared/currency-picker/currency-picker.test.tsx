import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')

const { CurrencyPicker } = await import('./currency-picker')
const { useCurrencyStore } = await import('@/lib/i18n/currency-store')
const { axiosInstance } = await import('@/data-access/_shared/axios')

let mock: MockAdapter

beforeEach(() => {
  useCurrencyStore.setState({ currency: 'EUR' })
  mock = new MockAdapter(axiosInstance)
})

afterEach(() => {
  mock.restore()
})

describe('CurrencyPicker', () => {
  it('renders the current currency label', () => {
    renderWithIntl(<CurrencyPicker />)
    expect(screen.getByRole('button', { name: /select currency/i })).toBeInTheDocument()
    expect(screen.getByText(/EUR/)).toBeInTheDocument()
  })

  it('shows only non-active currencies in the dropdown', async () => {
    const user = userEvent.setup()
    renderWithIntl(<CurrencyPicker />)
    await user.click(screen.getByRole('button', { name: /select currency/i }))
    expect(screen.getByRole('menuitem', { name: /USD/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /GBP/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /JPY/ })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /EUR/ })).not.toBeInTheDocument()
  })

  it('updates the store when a currency is selected', async () => {
    const user = userEvent.setup()
    renderWithIntl(<CurrencyPicker />)
    await user.click(screen.getByRole('button', { name: /select currency/i }))
    await user.click(screen.getByRole('menuitem', { name: /USD/ }))
    expect(useCurrencyStore.getState().currency).toBe('USD')
  })

  it('propagates the selected currency to the next admin GET request as ?currency=', async () => {
    const user = userEvent.setup()
    mock.onGet('/admin/lists').reply(200, {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    })

    renderWithIntl(<CurrencyPicker />)
    await user.click(screen.getByRole('button', { name: /select currency/i }))
    await user.click(screen.getByRole('menuitem', { name: /JPY/ }))

    await axiosInstance.get('/admin/lists')

    expect(mock.history.get[0]?.params).toMatchObject({ currency: 'JPY' })
  })
})
