import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/data-access/auth/auth.api', () => ({
  loginApi: vi.fn(),
}))

vi.mock('@/lib/query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { queryClient: new QueryClient() }
})

vi.mock('@/data-access/_auth-storage', () => ({
  getAccessToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
  syncSessionCookie: vi.fn(),
  isAllowedBackofficeRole: (role: string) => role === 'admin' || role === 'moderator',
  SESSION_COOKIE_NAME: 'keimelion_session',
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
import { loginApi } from '@/data-access/auth/auth.api'
import { LoginForm } from '@/features/auth/components/login-form'

const ADMIN_USER = {
  id: 'u1',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email' as const,
  role: 'admin' as const,
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function renderLoginForm(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('LoginForm', () => {
  it('calls loginApi with the correct email and password on submit', async () => {
    vi.mocked(loginApi).mockResolvedValue({
      accessToken: 'tok',
      refreshToken: 'refresh',
      user: ADMIN_USER,
    })

    renderLoginForm()

    await userEvent.type(screen.getByLabelText('Email'), 'admin@keimelion.app')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith({
        email: 'admin@keimelion.app',
        password: 'secret123',
      })
    })
  })

  it('shows a toast error when validation fails on blank password', async () => {
    renderLoginForm()

    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')
    await userEvent.type(screen.getByLabelText('Email'), 'admin@keimelion.app')

    const { fireEvent } = await import('@testing-library/react')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email and password.')
    })
    expect(loginApi).not.toHaveBeenCalled()
  })

  it('clears the password field on mutation error', async () => {
    vi.mocked(loginApi).mockRejectedValue(new Error('Invalid credentials'))

    renderLoginForm()

    await userEvent.type(screen.getByLabelText('Email'), 'bad@keimelion.app')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Password')).toHaveValue('')
    })
  })
})
