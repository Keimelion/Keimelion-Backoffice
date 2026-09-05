import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams('token=test-token-abc'),
}))

vi.mock('@/data-access/auth/auth.api', () => ({
  resetPasswordApi: vi.fn(),
}))

vi.mock('@/data-access/_auth-storage', () => ({
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

import { toast } from 'sonner'
import { resetPasswordApi } from '@/data-access/auth/auth.api'
import { clearSession } from '@/data-access/_auth-storage'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

function renderResetPasswordForm(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <ResetPasswordForm />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ResetPasswordForm', () => {
  it('calls resetPasswordApi with token and new password on submit', async () => {
    vi.mocked(resetPasswordApi).mockResolvedValue({ message: 'ok' })

    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(resetPasswordApi).toHaveBeenCalledWith({
        token: 'test-token-abc',
        newPassword: 'newpassword123',
      })
    })
  })

  it('shows a toast error when passwords do not match', async () => {
    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'differentpassword')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Passwords do not match')
    })
    expect(resetPasswordApi).not.toHaveBeenCalled()
  })

  it('shows a toast error when password is too short', async () => {
    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'short')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
    expect(resetPasswordApi).not.toHaveBeenCalled()
  })

  it('redirects to /login?reset=success on success', async () => {
    vi.mocked(resetPasswordApi).mockResolvedValue({ message: 'ok' })

    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login?reset=success')
    })
  })

  it('clears the local session on success so a stale token cannot outlive the reset', async () => {
    vi.mocked(resetPasswordApi).mockResolvedValue({ message: 'ok' })

    renderResetPasswordForm()

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(clearSession).toHaveBeenCalled()
    })
  })
})
