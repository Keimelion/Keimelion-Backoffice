import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { buildAdminReservationsKey, useAdminReservations } from './use-admin-reservations'

vi.mock('@/data-access/reservations/reservations.api', () => ({
  RESERVATIONS_QUERY_KEY: ['reservations'] as const,
  listAdminReservations: vi.fn(),
  fetchAdminReservation: vi.fn(),
  deleteAdminReservation: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import { listAdminReservations } from '@/data-access/reservations/reservations.api'

const RESERVATION_ID = '11111111-1111-4111-8111-111111111111'

const MOCK_RESPONSE: Awaited<ReturnType<typeof listAdminReservations>> = {
  items: [
    {
      id: RESERVATION_ID,
      quantityBooked: 2,
      createdAt: '2024-02-01T00:00:00.000Z',
      listItem: {
        id: 'li-1',
        name: 'Weighted blanket',
        quantityDesired: 3,
        image: null,
      },
      list: {
        id: 'list-1',
        slug: 'wedding',
        title: 'Wedding wishlist',
        owner: null,
      },
      user: {
        id: 'user-1',
        email: 'reserver@example.com',
        username: 'reserver',
        authProvider: 'email',
        role: 'user',
        avatarUrl: null,
        isCgvAccepted: true,
        cgvAcceptedAt: '2024-01-01T00:00:00.000Z',
        isMarketingOptedIn: false,
        defaultCurrency: 'EUR',
        emailVerifiedAt: '2024-01-01T00:00:00.000Z',
        lastActiveAt: '2024-02-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminReservationsKey', () => {
  it('produces the expected key shape', () => {
    const key = buildAdminReservationsKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('reservations')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ page: 1, limit: 20 })
  })

  it('strips undefined and empty values from the normalized filters', () => {
    const key = buildAdminReservationsKey({ page: 1, userId: undefined })
    expect('userId' in key[2]).toBe(false)
  })

  it('sorts filter keys for cache stability', () => {
    const keyA = buildAdminReservationsKey({ page: 1, userId: 'u-1', limit: 20 })
    const keyB = buildAdminReservationsKey({ limit: 20, userId: 'u-1', page: 1 })
    expect(JSON.stringify(keyA[2])).toBe(JSON.stringify(keyB[2]))
  })
})

describe('useAdminReservations', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(listAdminReservations).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminReservations({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items[0]?.listItem.name).toBe('Weighted blanket')
    expect(listAdminReservations).toHaveBeenCalledWith({ page: 1, limit: 20 })
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminReservations).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminReservations({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('is disabled and does not call fetch when enabled is false', async () => {
    const { result } = renderHook(
      () => useAdminReservations({ page: 1 }, { enabled: false }),
      { wrapper: createQueryClientWrapper() },
    )
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
    expect(listAdminReservations).not.toHaveBeenCalled()
  })
})
