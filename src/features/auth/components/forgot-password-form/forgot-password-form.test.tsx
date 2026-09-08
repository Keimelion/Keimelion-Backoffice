import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/data-access/auth/auth.api', () => ({
  forgotPasswordApi: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

import { forgotPasswordApi } from '@/data-access/auth/auth.api'
import { LOGIN_FORGOT_REQUESTED_URL } from '@/data-access/auth/auth.constants'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

function renderForgotPasswordForm(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <ForgotPasswordForm />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForgotPasswordForm', () => {
  it('calls forgotPasswordApi with the normalized email on submit', async () => {
    vi.mocked(forgotPasswordApi).mockResolvedValue({ message: 'ok' })

    renderForgotPasswordForm()

    await userEvent.type(screen.getByLabelText('Email'), 'Admin@Keimelion.app')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(forgotPasswordApi).toHaveBeenCalledWith({ email: 'admin@keimelion.app' })
    })
  })

  it('redirects to /login with the request-confirmation notice on success', async () => {
    vi.mocked(forgotPasswordApi).mockResolvedValue({ message: 'ok' })

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
    expect(forgotPasswordApi).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled()
  })
})
