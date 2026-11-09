import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode } from '@keimelion/sdk/enums'
import { HttpStatus } from '@keimelion/sdk/enums'
import { renderWithQueryClient } from '@/test/test-utils'

vi.mock('@/data-access/users/profile.api', () => ({
  updateMe: vi.fn(),
}))

vi.mock('@/data-access/_shared/auth-storage', () => ({
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
  rotateTokens: vi.fn(),
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
import { PersonalInfoForm } from '@/features/profile/components/personal-info-form'
import { ApiError } from '@keimelion/sdk/client'
import type { UserDetailParsed } from '@keimelion/sdk/schemas'

const BASE_USER: UserDetailParsed = {
  id: 'u-1',
  email: 'admin@keimelion.app',
  username: 'adminuser',
  authProvider: 'email',
  role: 'admin',
  avatarImageId: null,
  avatar: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  defaultCurrency: 'EUR',
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
}

function renderForm(user: UserDetailParsed = BASE_USER): void {
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

  it('prefills the username and shows the avatar file input', () => {
    renderForm(BASE_USER)
    expect(screen.getByLabelText('Username')).toHaveValue('adminuser')
    expect(screen.getByLabelText('Avatar')).toHaveAttribute('type', 'file')
  })

  it('uploads the selected avatar file through updateMe', async () => {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:avatar'), revokeObjectURL: vi.fn() }))
    vi.mocked(updateMe).mockResolvedValue(BASE_USER)
    const avatar = new File(['content'], 'avatar.png', { type: 'image/png' })

    renderForm()
    await userEvent.upload(screen.getByLabelText('Avatar'), avatar)
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateMe).toHaveBeenCalledWith({}, avatar)
    })
  })

  it('surfaces a rejected image type as an inline avatar error', async () => {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:avatar'), revokeObjectURL: vi.fn() }))
    vi.mocked(updateMe).mockRejectedValue(
      new ApiError({ code: ErrorCode.INVALID_IMAGE_TYPE, message: 'Invalid image type', status: 400, metadata: {} }),
    )
    const avatar = new File(['content'], 'avatar.png', { type: 'image/png' })

    renderForm()
    await userEvent.upload(screen.getByLabelText('Avatar'), avatar)
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Only JPEG, PNG and WebP images are accepted.')).toBeInTheDocument()
    })
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
      expect(updateMe).toHaveBeenCalledWith({ username: 'newname' }, null)
    })
  })

  it('surfaces a 409 as a username conflict error', async () => {
    vi.mocked(updateMe).mockRejectedValue(
      new ApiError({ code: ErrorCode.CONFLICT, message: 'Conflict', status: HttpStatus.CONFLICT, metadata: {} }),
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
      new ApiError({ code: ErrorCode.UNPROCESSABLE_ENTITY, message: 'Validation failed', status: HttpStatus.UNPROCESSABLE_ENTITY, metadata: { issues: [{ path: 'username', message: 'Not allowed.', code: 'custom' }] } }),
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
