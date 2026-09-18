import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'

vi.mock('@/data-access/users/admin-users.api', () => ({
  ADMIN_USERS_QUERY_KEY: ['users'],
  createAdminUser: vi.fn(),
}))

import { createAdminUser } from '@/data-access/users/admin-users.api'
import { useCreateUser } from './use-create-user'

const VALID_INPUT = {
  email: 'new@keimelion.app',
  role: 'user' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCreateUser', () => {
  it('calls createAdminUser with the provided input', async () => {
    vi.mocked(createAdminUser).mockResolvedValue({
      id: 'u-1',
      email: 'new@keimelion.app',
      username: null,
      role: 'user',
      avatarUrl: null,
      isCgvAccepted: false,
      cgvAcceptedAt: null,
      isMarketingOptedIn: false,
      emailVerifiedAt: null,
      lastActiveAt: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      bannedAt: null,
      banReason: null,
      deletedAt: null,
    })

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createQueryClientWrapper(),
    })

    act(() => {
      result.current.mutate(VALID_INPUT)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(vi.mocked(createAdminUser).mock.calls[0]?.[0]).toEqual(VALID_INPUT)
  })

  it('exposes an error when the mutation fails', async () => {
    const error = new Error('Network error')
    vi.mocked(createAdminUser).mockRejectedValue(error)

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createQueryClientWrapper(),
    })

    act(() => {
      result.current.mutate(VALID_INPUT)
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Network error')
  })
})
