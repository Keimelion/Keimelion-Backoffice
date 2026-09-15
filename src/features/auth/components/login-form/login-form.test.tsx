import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock(import('@/data-access/auth/login'), async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, login: vi.fn() }
})

vi.mock('@/lib/query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { queryClient: new QueryClient() }
})

vi.mock('@/data-access/_shared/auth-storage', () => ({
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

import { login } from '@/data-access/auth/login'
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
  renderWithQueryClient(<LoginForm />)
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('LoginForm', () => {
  it('calls login with the correct email and password on submit', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'tok',
      refreshToken: 'refresh',
      user: ADMIN_USER,
    })

    renderLoginForm()

    await userEvent.type(screen.getByLabelText('Email'), 'admin@keimelion.app')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'admin@keimelion.app',
        password: 'secret123',
      })
    })
  })

  it('shows an inline error and blocks submit when the password is blank', async () => {
    renderLoginForm()

    await userEvent.type(screen.getByLabelText('Email'), 'admin@keimelion.app')

    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Password is required.')).toBeInTheDocument()
    })
    expect(login).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
  })

  it('clears the password field on mutation error', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))

    renderLoginForm()

    await userEvent.type(screen.getByLabelText('Email'), 'bad@keimelion.app')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Password')).toHaveValue('')
    })
  })
})
