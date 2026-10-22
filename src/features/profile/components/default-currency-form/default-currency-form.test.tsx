import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode } from '@keimelion/api/shared/enums/error-code'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { renderWithQueryClient } from '@/test/test-utils'
import type { ApiUser } from '@/data-access/_shared/user'

vi.mock('@/data-access/users/profile.api', () => ({
  updateMe: vi.fn(),
}))

vi.mock('@/data-access/_shared/auth-storage', () => ({
  updateStoredUser: vi.fn(),
}))

const hoisted = vi.hoisted(() => ({
  setCurrencyMock: vi.fn(),
  toastMocks: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('@/lib/i18n/currency-store', () => ({
  useCurrencyStore: { getState: () => ({ setCurrency: hoisted.setCurrencyMock }) },
}))

vi.mock('@/lib/query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { queryClient: new QueryClient() }
})

vi.mock('sonner', () => ({
  toast: hoisted.toastMocks,
}))

import { updateMe } from '@/data-access/users/profile.api'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { DefaultCurrencyForm } from '@/features/profile/components/default-currency-form'

const BASE_USER: ApiUser = {
  id: 'u-1',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email',
  role: 'admin',
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  defaultCurrency: 'EUR',
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function renderForm(user: ApiUser = BASE_USER): void {
  renderWithQueryClient(<DefaultCurrencyForm user={user} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DefaultCurrencyForm', () => {
  it('prefills the select with the user default currency', () => {
    renderForm()
    expect(screen.getByRole('combobox')).toHaveTextContent('EUR')
  })

  it('calls updateMe with the new currency on change', async () => {
    vi.mocked(updateMe).mockResolvedValue({ ...BASE_USER, defaultCurrency: 'USD' })

    renderForm()

    await userEvent.click(screen.getByRole('combobox'))
    const option = await screen.findByRole('option', { name: /USD/i })
    await userEvent.click(option)

    await waitFor(() => {
      expect(updateMe).toHaveBeenCalledWith({ defaultCurrency: 'USD' })
    })
  })

  it('shows a success toast and syncs the currency store on success', async () => {
    vi.mocked(updateMe).mockResolvedValue({ ...BASE_USER, defaultCurrency: 'USD' })

    renderForm()

    await userEvent.click(screen.getByRole('combobox'))
    const option = await screen.findByRole('option', { name: /USD/i })
    await userEvent.click(option)

    await waitFor(() => {
      expect(hoisted.toastMocks.success).toHaveBeenCalled()
      expect(hoisted.setCurrencyMock).toHaveBeenCalledWith('USD')
    })
  })

  it('reports an API 422 as a toast error', async () => {
    vi.mocked(updateMe).mockRejectedValue(
      new ApiRequestError(
        ErrorCode.UNPROCESSABLE_ENTITY,
        'currency must be one of…',
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
    )

    renderForm()

    await userEvent.click(screen.getByRole('combobox'))
    const option = await screen.findByRole('option', { name: /USD/i })
    await userEvent.click(option)

    await waitFor(() => {
      expect(hoisted.toastMocks.error).toHaveBeenCalled()
    })
    expect(hoisted.setCurrencyMock).not.toHaveBeenCalled()
  })
})
