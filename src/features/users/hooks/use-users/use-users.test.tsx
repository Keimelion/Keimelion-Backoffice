import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useUsers, buildUsersListKey } from './use-users'

vi.mock(import('@/data-access/users/list-users'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    listUsers: vi.fn(),
  }
})

import { listUsers } from '@/data-access/users/list-users'

const MOCK_USER = {
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
  bannedAt: null,
  banReason: null,
  deletedAt: null,
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
