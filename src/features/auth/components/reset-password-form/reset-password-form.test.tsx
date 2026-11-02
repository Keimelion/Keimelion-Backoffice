import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams('token=test-token-abc'),
}))

vi.mock(import('@/data-access/auth/reset-password'), async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, resetPassword: vi.fn() }
})

vi.mock('@/data-access/_shared/auth-storage', () => ({
  clearSession: vi.fn(),
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

import { resetPassword } from '@/data-access/auth/reset-password'
import { LOGIN_RESET_SUCCESS_URL } from '@/data-access/auth/notices'
import { clearSession } from '@/data-access/_shared/auth-storage'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

function renderResetPasswordForm(): void {
  renderWithQueryClient(<ResetPasswordForm />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ResetPasswordForm', () => {
  it('calls resetPassword with token and new password on submit', async () => {
    vi.mocked(resetPassword).mockResolvedValue(undefined)

    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'test-token-abc',
        newPassword: 'newpassword123',
      })
    })
  })

  it('shows an inline error and blocks submit when passwords do not match', async () => {
    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'differentpassword')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    })
    expect(resetPassword).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /update password/i })).toBeDisabled()
  })

  it('shows an inline error and blocks submit when password is too short', async () => {
    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'short')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters.'),
      ).toBeInTheDocument()
    })
    expect(resetPassword).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /update password/i })).toBeDisabled()
  })

  it('redirects to /login with the reset-success notice on success', async () => {
    vi.mocked(resetPassword).mockResolvedValue(undefined)

    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(LOGIN_RESET_SUCCESS_URL)
    })
  })

  it('clears the local session on success so a stale token cannot outlive the reset', async () => {
    vi.mocked(resetPassword).mockResolvedValue(undefined)

    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(clearSession).toHaveBeenCalled()
    })
  })
})
