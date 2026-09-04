import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/features/auth/auth-storage', () => ({
  getAccessToken: vi.fn(),
  getStoredUser: vi.fn(),
}))

import type { ApiUser } from '@/data-access/auth/auth.api'
import { getAccessToken, getStoredUser } from '@/features/auth/auth-storage'
import { RequireAuth } from '@/components/shared/require-auth'

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

const MOD_USER = { ...ADMIN_USER, role: 'moderator' as const }
const STD_USER = { ...ADMIN_USER, role: 'user' as const }

function renderWithQuery(ui: React.ReactElement, user: ApiUser | null): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  if (user) {
    client.setQueryData(['currentUser'], user)
  }
  render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockReplace.mockReset()
})

describe('RequireAuth', () => {
  it('redirects to /login when there is no access token', async () => {
    vi.mocked(getAccessToken).mockReturnValue(null)
    vi.mocked(getStoredUser).mockReturnValue(null)

    renderWithQuery(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
      null,
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects to /login when role is user', async () => {
    vi.mocked(getAccessToken).mockReturnValue('tok')
    vi.mocked(getStoredUser).mockReturnValue(STD_USER)

    renderWithQuery(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
      STD_USER,
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when role is admin', async () => {
    vi.mocked(getAccessToken).mockReturnValue('tok')
    vi.mocked(getStoredUser).mockReturnValue(ADMIN_USER)

    renderWithQuery(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
      ADMIN_USER,
    )

    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('renders children when role is moderator', async () => {
    vi.mocked(getAccessToken).mockReturnValue('tok')
    vi.mocked(getStoredUser).mockReturnValue(MOD_USER)

    renderWithQuery(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
      MOD_USER,
    )

    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
