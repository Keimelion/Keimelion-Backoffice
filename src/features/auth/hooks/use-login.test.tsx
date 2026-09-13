import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryClientWrapper } from '@/test/query-test-utils'
import { useLogin } from '@/features/auth/hooks/use-login'
import { getAccessToken, getRefreshToken, getStoredUser } from '@/data-access/_shared/auth-storage'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('@/data-access/auth/login', () => ({
  login: vi.fn(),
}))

vi.mock('@/lib/query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { queryClient: new QueryClient() }
})

import { login } from '@/data-access/auth/login'
import { ApiRequestError } from '@/data-access/_shared/api-error'

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

const STANDARD_USER = { ...ADMIN_USER, role: 'user' as const }

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('useLogin', () => {
  it('persists token and seeds currentUser on successful admin login', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'tok-abc',
      refreshToken: 'refresh-xyz',
      user: ADMIN_USER,
    })

    const { result } = renderHook(() => useLogin(), { wrapper: createQueryClientWrapper() })
    result.current.mutate({ email: 'admin@keimelion.app', password: 'secret' })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getAccessToken()).toBe('tok-abc')
    expect(getRefreshToken()).toBe('refresh-xyz')
    expect(getStoredUser()).toEqual(ADMIN_USER)
  })

  it('does NOT persist token when role is user', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'tok-user',
      refreshToken: 'refresh-user',
      user: STANDARD_USER,
    })

    const { result } = renderHook(() => useLogin(), { wrapper: createQueryClientWrapper() })
    result.current.mutate({ email: 'user@keimelion.app', password: 'secret' })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(getAccessToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
    expect(result.current.error?.message).toContain('not authorized')
  })

  it('surfaces the ApiRequestError when login() rejects on malformed payload', async () => {
    vi.mocked(login).mockRejectedValue(
      new ApiRequestError('INVALID_RESPONSE', 'The server returned an unexpected login payload.', 200),
    )

    const { result } = renderHook(() => useLogin(), { wrapper: createQueryClientWrapper() })
    result.current.mutate({ email: 'admin@keimelion.app', password: 'secret' })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(getAccessToken()).toBeNull()
    expect(result.current.error).toBeInstanceOf(ApiRequestError)
  })
})
