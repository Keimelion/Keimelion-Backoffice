import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
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

import { toast } from 'sonner'
import { forgotPasswordApi } from '@/data-access/auth/auth.api'
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

  it('shows a neutral success message after submission', async () => {
    vi.mocked(forgotPasswordApi).mockResolvedValue({ message: 'ok' })

    renderForgotPasswordForm()

    await userEvent.type(screen.getByLabelText('Email'), 'admin@keimelion.app')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/if an account with that email exists/i)).toBeInTheDocument()
  })

  it('shows a toast error when the email field is empty on submit', async () => {
    renderForgotPasswordForm()

    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form')
    const { fireEvent } = await import('@testing-library/react')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address.')
    })
    expect(forgotPasswordApi).not.toHaveBeenCalled()
  })
})
