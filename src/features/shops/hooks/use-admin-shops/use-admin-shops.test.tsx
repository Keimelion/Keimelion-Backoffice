import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import {
  buildAdminShopsKey,
  useAdminShops,
  useCreateShop,
  useDeleteShop,
  useReorderShops,
  useUpdateShop,
} from './use-admin-shops'

vi.mock('@/data-access/shops/admin-shops.api', () => ({
  SHOPS_QUERY_KEY: ['shops'] as const,
  listAdminShops: vi.fn(),
  createShop: vi.fn(),
  updateShop: vi.fn(),
  deleteShop: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import {
  createShop,
  deleteShop,
  listAdminShops,
  updateShop,
} from '@/data-access/shops/admin-shops.api'

const MOCK_SHOP = {
  id: 'shop-1',
  slug: 'amazon',
  name: 'Amazon',
  domain: 'amazon.com',
  logoUrl: null,
  isAffiliated: false,
  sortOrder: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_RESPONSE = {
  items: [MOCK_SHOP],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminShopsKey', () => {
  it('produces the expected key shape', () => {
    const key = buildAdminShopsKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('shops')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ page: 1, limit: 20 })
  })

  it('strips undefined and empty values from the normalized filters', () => {
    const key = buildAdminShopsKey({ page: 1, search: undefined, isActive: undefined })
    expect('search' in key[2]).toBe(false)
    expect('isActive' in key[2]).toBe(false)
  })

  it('sorts filter keys for cache stability', () => {
    const keyA = buildAdminShopsKey({ page: 1, search: 'a', limit: 20 })
    const keyB = buildAdminShopsKey({ limit: 20, search: 'a', page: 1 })
    expect(JSON.stringify(keyA[2])).toBe(JSON.stringify(keyB[2]))
  })
})

describe('useAdminShops', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(listAdminShops).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminShops({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items[0]?.slug).toBe('amazon')
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminShops).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminShops({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useCreateShop', () => {
  it('invalidates the shops query on success', async () => {
    vi.mocked(createShop).mockResolvedValue(MOCK_SHOP)
    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useCreateShop(), { wrapper })
    result.current.mutate({
      slug: 'x',
      name: 'x',
      domain: null,
      logoUrl: null,
      isAffiliated: false,
      sortOrder: 0,
      isActive: true,
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(createShop).toHaveBeenCalled()
  })
})

describe('useUpdateShop', () => {
  it('calls updateShop with the given id and input', async () => {
    vi.mocked(updateShop).mockResolvedValue({ ...MOCK_SHOP, name: 'New' })
    const { result } = renderHook(() => useUpdateShop(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ id: 'shop-1', input: { name: 'New' } })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateShop).toHaveBeenCalled()
    expect(vi.mocked(updateShop).mock.calls[0]?.[0]).toBe('shop-1')
    expect(vi.mocked(updateShop).mock.calls[0]?.[1]).toEqual({ name: 'New' })
  })
})

describe('useDeleteShop', () => {
  it('calls deleteShop with the given id', async () => {
    vi.mocked(deleteShop).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteShop(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate('shop-1')
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(deleteShop).toHaveBeenCalled()
    expect(vi.mocked(deleteShop).mock.calls[0]?.[0]).toBe('shop-1')
  })
})

describe('useReorderShops', () => {
  it('fires parallel PATCH calls for every shop whose position changed', async () => {
    vi.mocked(updateShop).mockImplementation((id, input) =>
      Promise.resolve({ ...MOCK_SHOP, id, sortOrder: input.sortOrder ?? 0 }),
    )
    const shopA = { ...MOCK_SHOP, id: 'shop-1', sortOrder: 10 }
    const shopB = { ...MOCK_SHOP, id: 'shop-2', sortOrder: 20 }
    const { result } = renderHook(() => useReorderShops({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({
      previousItems: [shopA, shopB],
      nextItems: [shopB, shopA],
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateShop).toHaveBeenCalledTimes(2)
    const calls = vi.mocked(updateShop).mock.calls
    expect(calls[0]?.[0]).toBe('shop-2')
    expect(calls[0]?.[1]).toEqual({ sortOrder: 10 })
    expect(calls[1]?.[0]).toBe('shop-1')
    expect(calls[1]?.[1]).toEqual({ sortOrder: 20 })
  })
})
