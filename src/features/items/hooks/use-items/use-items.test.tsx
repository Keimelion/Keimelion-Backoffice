import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useItem, useItems } from './use-items'

vi.mock(import('@/data-access/items/items.api'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    fetchItems: vi.fn(),
    fetchItem: vi.fn(),
  }
})

import { fetchItem, fetchItems } from '@/data-access/items/items.api'

const MOCK_ITEM = {
  id: 'item-1',
  name: 'Espresso machine',
  description: null,
  imageUrl: null,
  moderationStatus: 'approved' as const,
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
}

const MOCK_RESPONSE = {
  items: [MOCK_ITEM],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useItems', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(fetchItems).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useItems({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0]?.name).toBe('Espresso machine')
  })

  it('exposes isError on fetch failure', async () => {
    vi.mocked(fetchItems).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useItems({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.error?.message).toBe('Network error')
  })
})

describe('useItem', () => {
  it('returns the item detail on successful fetch', async () => {
    vi.mocked(fetchItem).mockResolvedValue(MOCK_ITEM)
    const { result } = renderHook(() => useItem('item-1'), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.id).toBe('item-1')
  })
})
