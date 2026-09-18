import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'

vi.mock('@/data-access/users/admin-users.api', () => ({
  ADMIN_USERS_QUERY_KEY: ['users'],
  deleteAdminUser: vi.fn(),
}))

import { deleteAdminUser } from '@/data-access/users/admin-users.api'
import { useDeleteUser } from './use-delete-user'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useDeleteUser', () => {
  it('calls deleteAdminUser with the user id', async () => {
    vi.mocked(deleteAdminUser).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createQueryClientWrapper(),
    })

    act(() => {
      result.current.mutate('u-1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(vi.mocked(deleteAdminUser).mock.calls[0]?.[0]).toBe('u-1')
  })

  it('exposes an error when the mutation fails', async () => {
    const error = new Error('Server error')
    vi.mocked(deleteAdminUser).mockRejectedValue(error)

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createQueryClientWrapper(),
    })

    act(() => {
      result.current.mutate('u-1')
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Server error')
  })
})
