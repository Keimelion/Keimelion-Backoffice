import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode } from '@keimelion/api/shared/enums/error-code'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { renderWithQueryClient } from '@/test/test-utils'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/data-access/users/profile.api', () => ({
  changeMyPassword: vi.fn(),
}))

vi.mock('@/data-access/_shared/auth-storage', () => ({
  clearSession: vi.fn(),
}))

vi.mock('@/data-access/_shared/auth-storage/refresh-scheduler', () => ({
  stopAutoRefresh: vi.fn(),
}))

vi.mock('@/lib/query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { queryClient: new QueryClient() }
})

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

import { changeMyPassword } from '@/data-access/users/profile.api'
import { clearSession } from '@/data-access/_shared/auth-storage'
import { LOGIN_PASSWORD_CHANGED_URL } from '@/data-access/auth/notices'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { ChangePasswordForm } from '@/features/profile/components/change-password-form'

function renderForm(): void {
  renderWithQueryClient(<ChangePasswordForm />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ChangePasswordForm', () => {
  it('submits currentPassword and newPassword when the form is valid', async () => {
    vi.mocked(changeMyPassword).mockResolvedValue({ message: 'ok' })

    renderForm()

    await userEvent.type(screen.getByLabelText('Current password'), 'oldpassword1')
    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(changeMyPassword).toHaveBeenCalledWith({
        currentPassword: 'oldpassword1',
        newPassword: 'newpassword123',
      })
    })
  })

  it('clears the session and redirects to /login on success', async () => {
    vi.mocked(changeMyPassword).mockResolvedValue({ message: 'ok' })

    renderForm()

    await userEvent.type(screen.getByLabelText('Current password'), 'oldpassword1')
    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(clearSession).toHaveBeenCalled()
      expect(mockReplace).toHaveBeenCalledWith(LOGIN_PASSWORD_CHANGED_URL)
    })
  })

  it('shows an inline error when confirm does not match new password', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText('Current password'), 'oldpassword1')
    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'different-one')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    })
    expect(changeMyPassword).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled()
  })

  it('blocks submit when the new password reuses the current one', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText('Current password'), 'samepass1234')
    await userEvent.type(screen.getByLabelText('New password'), 'samepass1234')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'samepass1234')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(
        screen.getByText('New password must differ from current password.'),
      ).toBeInTheDocument()
    })
    expect(changeMyPassword).not.toHaveBeenCalled()
  })

  it('blocks submit when the new password is shorter than 8 characters', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText('Current password'), 'oldpassword1')
    await userEvent.type(screen.getByLabelText('New password'), 'short')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(
        screen.getByText('New password must be at least 8 characters.'),
      ).toBeInTheDocument()
    })
    expect(changeMyPassword).not.toHaveBeenCalled()
  })

  it('surfaces INVALID_CREDENTIALS on the current-password field', async () => {
    vi.mocked(changeMyPassword).mockRejectedValue(
      new ApiRequestError(ErrorCode.INVALID_CREDENTIALS, 'Current password is incorrect', HttpStatus.BAD_REQUEST),
    )

    renderForm()

    await userEvent.type(screen.getByLabelText('Current password'), 'oldpassword1')
    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect.')).toBeInTheDocument()
    })
    expect(clearSession).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Current password')).toHaveValue('')
  })

  it('maps API 422 issues to the matching fields', async () => {
    vi.mocked(changeMyPassword).mockRejectedValue(
      new ApiRequestError(
        ErrorCode.UNPROCESSABLE_ENTITY,
        'Validation failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
        [
          { path: 'newPassword', message: 'Password too weak.', code: 'custom' },
        ],
      ),
    )

    renderForm()

    await userEvent.type(screen.getByLabelText('Current password'), 'oldpassword1')
    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(screen.getByText('Password too weak.')).toBeInTheDocument()
    })
  })
})
