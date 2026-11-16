import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper, createTestQueryClient } from '@/test/test-utils'
import { useResendStaffInvitation, useUsers, buildUsersListKey } from './use-users'

vi.mock(import('@/data-access/users/admin-users.api'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    listUsers: vi.fn(),
    resendStaffInvitation: vi.fn(),
  }
})

import { listUsers, resendStaffInvitation } from '@/data-access/users/admin-users.api'

const MOCK_USER = {
  id: 'u1',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email' as const,
  role: 'admin' as const,
  avatarImageId: null,
  avatar: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  defaultCurrency: 'EUR' as const,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  bannedAt: null,
  banReason: null,
  deletedAt: null,
  activatedAt: new Date('2024-01-02T00:00:00.000Z'),
  status: 'active' as const,
  reservationsCount: 0,
}

const MOCK_RESPONSE = {
  items: [MOCK_USER],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useUsers', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(listUsers).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useUsers({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0]?.email).toBe('admin@keimelion.app')
  })

  it('exposes isError on fetch failure', async () => {
    vi.mocked(listUsers).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.error?.message).toBe('Network error')
  })
})

describe('buildUsersListKey', () => {
  it('produces the expected key shape', () => {
    const key = buildUsersListKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('users')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ limit: 20, page: 1 })
  })

  it('strips undefined values from the normalized filters', () => {
    const key = buildUsersListKey({ page: 1, email: undefined })
    const normalizedFilters = key[2]
    expect('email' in normalizedFilters).toBe(false)
  })

  it('sorts filter keys for cache stability', () => {
    const keyA = buildUsersListKey({ page: 1, email: 'a@b.com', limit: 20 })
    const keyB = buildUsersListKey({ limit: 20, email: 'a@b.com', page: 1 })
    expect(JSON.stringify(keyA[2])).toBe(JSON.stringify(keyB[2]))
  })
})

describe('useResendStaffInvitation', () => {
  const LIST_KEY = buildUsersListKey({ page: 1 })
  const INVITED_USER = { ...MOCK_USER, status: 'invited' as const, activatedAt: null }

  function renderResendHook(): {
    result: { current: ReturnType<typeof useResendStaffInvitation> }
    queryClient: ReturnType<typeof createTestQueryClient>
  } {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(LIST_KEY, { ...MOCK_RESPONSE, items: [INVITED_USER] })
    const { result } = renderHook(() => useResendStaffInvitation(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })
    return { result, queryClient }
  }

  it('replaces the user in the cached list with the user returned by the API', async () => {
    const refreshedUser = { ...INVITED_USER, updatedAt: new Date('2024-02-01T00:00:00.000Z') }
    vi.mocked(resendStaffInvitation).mockResolvedValue(refreshedUser)
    const { result, queryClient } = renderResendHook()

    await act(async () => {
      await result.current.mutateAsync(INVITED_USER.id)
    })

    const cached = queryClient.getQueryData<typeof MOCK_RESPONSE>(LIST_KEY)
    expect(cached?.items[0]).toEqual(refreshedUser)
  })

  it('invalidates the users queries on failure so the status is refreshed', async () => {
    vi.mocked(resendStaffInvitation).mockRejectedValue(new Error('Not pending'))
    const { result, queryClient } = renderResendHook()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await act(async () => {
      await expect(result.current.mutateAsync(INVITED_USER.id)).rejects.toThrow('Not pending')
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] })
  })
})
