import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock(import('@/data-access/auth/forgot-password'), async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, forgotPassword: vi.fn() }
})

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

import { forgotPassword } from '@/data-access/auth/forgot-password'
import { LOGIN_FORGOT_REQUESTED_URL } from '@/data-access/auth/notices'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

function renderForgotPasswordForm(): void {
  renderWithQueryClient(<ForgotPasswordForm />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForgotPasswordForm', () => {
  it('calls forgotPassword with the normalized email on submit', async () => {
    vi.mocked(forgotPassword).mockResolvedValue(undefined)

    renderForgotPasswordForm()

    await userEvent.type(screen.getByLabelText('Email'), 'Admin@Keimelion.app')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith({ email: 'admin@keimelion.app' })
    })
  })

  it('redirects to /login with the request-confirmation notice on success', async () => {
    vi.mocked(forgotPassword).mockResolvedValue(undefined)

    renderForgotPasswordForm()

    await userEvent.type(screen.getByLabelText('Email'), 'admin@keimelion.app')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(LOGIN_FORGOT_REQUESTED_URL)
    })
  })

  it('shows an inline error and blocks submit when the email field is empty', async () => {
    renderForgotPasswordForm()

    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    })
    expect(forgotPassword).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled()
  })
})
