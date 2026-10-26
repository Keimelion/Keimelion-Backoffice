import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useDeleteAdminReservation } from './use-delete-admin-reservation'

vi.mock('@/data-access/reservations/reservations.api', () => ({
  RESERVATIONS_QUERY_KEY: ['reservations'] as const,
  deleteAdminReservation: vi.fn(),
}))

vi.mock('@/data-access/items/items.api', () => ({
  ITEMS_QUERY_KEY: ['items'] as const,
}))

vi.mock('@/data-access/users/admin-users.api', () => ({
  ADMIN_USERS_QUERY_KEY: ['users'] as const,
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import { deleteAdminReservation } from '@/data-access/reservations/reservations.api'

const RESERVATION_ID = '11111111-1111-4111-8111-111111111111'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useDeleteAdminReservation', () => {
  it('calls deleteAdminReservation with the given id', async () => {
    vi.mocked(deleteAdminReservation).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteAdminReservation(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate(RESERVATION_ID)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(deleteAdminReservation).toHaveBeenCalled()
    expect(vi.mocked(deleteAdminReservation).mock.calls[0]?.[0]).toBe(RESERVATION_ID)
  })

  it('surfaces errors', async () => {
    vi.mocked(deleteAdminReservation).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useDeleteAdminReservation(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate(RESERVATION_ID)
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
