import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'

vi.mock('@/data-access/users/admin-users.api', () => ({
  ADMIN_USERS_QUERY_KEY: ['users'],
  updateAdminUser: vi.fn(),
}))

import { updateAdminUser } from '@/data-access/users/admin-users.api'
import { useUpdateUser } from './use-update-user'

const MOCK_UPDATED_USER = {
  id: 'u-1',
  email: 'user@keimelion.app',
  username: 'testuser',
  authProvider: 'email' as const,
  role: 'moderator' as const,
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  bannedAt: null,
  banReason: null,
  deletedAt: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useUpdateUser', () => {
  it('calls updateAdminUser with id and input', async () => {
    vi.mocked(updateAdminUser).mockResolvedValue(MOCK_UPDATED_USER)

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createQueryClientWrapper(),
    })

    act(() => {
      result.current.mutate({ id: 'u-1', input: { role: 'moderator' } })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const firstCall = vi.mocked(updateAdminUser).mock.calls[0]
    expect(firstCall?.[0]).toBe('u-1')
    expect(firstCall?.[1]).toEqual({ role: 'moderator' })
  })

  it('exposes an error when the mutation fails', async () => {
    const error = new Error('Not found')
    vi.mocked(updateAdminUser).mockRejectedValue(error)

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createQueryClientWrapper(),
    })

    act(() => {
      result.current.mutate({ id: 'u-1', input: { role: 'admin' } })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Not found')
  })
})
