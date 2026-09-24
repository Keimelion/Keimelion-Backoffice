import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useShops } from './use-shops'

vi.mock(import('@/data-access/shops/shops.api'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    fetchShops: vi.fn(),
  }
})

import { fetchShops } from '@/data-access/shops/shops.api'

const MOCK_SHOP = {
  id: 'shop-1',
  slug: 'amazon',
  name: 'Amazon',
  domain: 'amazon.com',
  logoUrl: null,
  isAffiliated: true,
  sortOrder: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useShops', () => {
  it('returns the shop list on successful fetch', async () => {
    vi.mocked(fetchShops).mockResolvedValue([MOCK_SHOP])
    const { result } = renderHook(() => useShops(), { wrapper: createQueryClientWrapper() })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]?.name).toBe('Amazon')
  })

  it('exposes isError on fetch failure', async () => {
    vi.mocked(fetchShops).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useShops(), { wrapper: createQueryClientWrapper() })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.error?.message).toBe('Network error')
  })
})
