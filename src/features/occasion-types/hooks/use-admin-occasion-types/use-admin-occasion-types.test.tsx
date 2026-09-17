import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useAdminOccasionTypes, buildAdminOccasionTypesKey } from './use-admin-occasion-types'

vi.mock('@/data-access/occasion-types/admin-occasion-types.api', () => ({
  listAdminOccasionTypes: vi.fn(),
}))

import { listAdminOccasionTypes } from '@/data-access/occasion-types/admin-occasion-types.api'

const MOCK_ITEM = {
  id: 'ot-1',
  slug: 'birthday',
  emoji: '🎂',
  sortOrder: 0,
  isActive: true,
  translations: [{ locale: 'en', label: 'Birthday' }],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_RESPONSE = {
  items: [MOCK_ITEM],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAdminOccasionTypes', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(listAdminOccasionTypes).mockResolvedValue(MOCK_RESPONSE)

    const { result } = renderHook(() => useAdminOccasionTypes({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0]?.slug).toBe('birthday')
  })

  it('exposes isError on fetch failure', async () => {
    vi.mocked(listAdminOccasionTypes).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAdminOccasionTypes({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Network error')
  })
})

describe('buildAdminOccasionTypesKey', () => {
  it('returns the expected key shape', () => {
    const key = buildAdminOccasionTypesKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('occasion-types')
    expect(key[1]).toBe('admin')
    expect(key[2]).toBe('list')
    expect(key[3]).toMatchObject({ page: 1, limit: 20 })
  })
})
