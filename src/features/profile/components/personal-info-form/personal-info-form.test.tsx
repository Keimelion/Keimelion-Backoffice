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

vi.mock('@/lib/query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { queryClient: new QueryClient() }
})

vi.mock('@/lib/i18n/currency-store', () => ({
  useCurrencyStore: { getState: () => ({ setCurrency: vi.fn() }) },
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import { updateMe } from '@/data-access/users/profile.api'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { PersonalInfoForm } from '@/features/profile/components/personal-info-form'

const BASE_USER: ApiUser = {
  id: 'u-1',
  email: 'admin@keimelion.app',
  username: 'adminuser',
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
  renderWithQueryClient(<PersonalInfoForm user={user} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PersonalInfoForm', () => {
  it('renders the email as read-only', () => {
    renderForm()
    const emailInput = screen.getByDisplayValue('admin@keimelion.app')
    expect(emailInput).toBeDisabled()
    expect(emailInput).toHaveAttribute('readonly')
  })

  it('prefills the username and avatar fields with the user values', () => {
    renderForm({ ...BASE_USER, avatarUrl: 'https://example.com/a.png' })
    expect(screen.getByLabelText('Username')).toHaveValue('adminuser')
    expect(screen.getByLabelText('Avatar URL')).toHaveValue('https://example.com/a.png')
  })

  it('keeps the submit button disabled while the form is pristine', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })

  it('calls updateMe only with the changed fields', async () => {
    vi.mocked(updateMe).mockResolvedValue({ ...BASE_USER, username: 'newname' })

    renderForm()
    const usernameInput = screen.getByLabelText('Username')
    await userEvent.clear(usernameInput)
    await userEvent.type(usernameInput, 'newname')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateMe).toHaveBeenCalledWith({ username: 'newname' })
    })
  })

  it('surfaces a 409 as a username conflict error', async () => {
    vi.mocked(updateMe).mockRejectedValue(
      new ApiRequestError(ErrorCode.CONFLICT, 'Conflict', HttpStatus.CONFLICT),
    )

    renderForm()
    const usernameInput = screen.getByLabelText('Username')
    await userEvent.clear(usernameInput)
    await userEvent.type(usernameInput, 'taken')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText('This email or username is already in use.')).toBeInTheDocument()
    })
  })

  it('maps API 422 issues to the matching fields', async () => {
    vi.mocked(updateMe).mockRejectedValue(
      new ApiRequestError(
        ErrorCode.UNPROCESSABLE_ENTITY,
        'Validation failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
        [{ path: 'username', message: 'Not allowed.', code: 'custom' }],
      ),
    )

    renderForm()
    const usernameInput = screen.getByLabelText('Username')
    await userEvent.clear(usernameInput)
    await userEvent.type(usernameInput, 'badname')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Not allowed.')).toBeInTheDocument()
    })
  })
})
