import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useItemSources } from './use-item-sources'

vi.mock(import('@/data-access/items/item-sources.api'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    fetchItemSources: vi.fn(),
  }
})

import { fetchItemSources } from '@/data-access/items/item-sources.api'

const MOCK_SOURCE = {
  id: 'source-1',
  itemId: 'item-1',
  shopId: null,
  sourceUrl: 'https://shop.example.com/product',
  price: '19.99',
  currency: 'EUR',
  isPrimary: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useItemSources', () => {
  it('returns the sources list on successful fetch', async () => {
    vi.mocked(fetchItemSources).mockResolvedValue([MOCK_SOURCE])
    const { result } = renderHook(() => useItemSources('item-1'), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data).toHaveLength(1)
    expect(fetchItemSources).toHaveBeenCalledWith('item-1')
  })

  it('exposes isError on fetch failure', async () => {
    vi.mocked(fetchItemSources).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useItemSources('item-1'), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
