import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import {
  buildAdminItemsKey,
  useAdminItems,
  useCreateItem,
  useDeleteItem,
  useUpdateItem,
} from './use-admin-items'

vi.mock('@/data-access/items/items.api', () => ({
  ITEMS_QUERY_KEY: ['items'] as const,
  listAdminItems: vi.fn(),
  fetchAdminItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import {
  createItem,
  deleteItem,
  listAdminItems,
  updateItem,
} from '@/data-access/items/items.api'

const MOCK_ITEM = {
  id: 'item-1',
  name: 'Blanket',
  description: null,
  imageUrl: null,
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  sources: [],
}

const MOCK_RESPONSE = {
  items: [MOCK_ITEM],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminItemsKey', () => {
  it('produces the expected key shape', () => {
    const key = buildAdminItemsKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('items')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ page: 1, limit: 20 })
  })

  it('strips undefined and empty values from the normalized filters', () => {
    const key = buildAdminItemsKey({ page: 1, search: undefined })
    expect('search' in key[2]).toBe(false)
  })

  it('sorts filter keys for cache stability', () => {
    const keyA = buildAdminItemsKey({ page: 1, search: 'a', limit: 20 })
    const keyB = buildAdminItemsKey({ limit: 20, search: 'a', page: 1 })
    expect(JSON.stringify(keyA[2])).toBe(JSON.stringify(keyB[2]))
  })
})

describe('useAdminItems', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(listAdminItems).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminItems({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items[0]?.name).toBe('Blanket')
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminItems).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminItems({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useCreateItem', () => {
  it('calls createItem on mutate', async () => {
    vi.mocked(createItem).mockResolvedValue(MOCK_ITEM)
    const { result } = renderHook(() => useCreateItem(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({
      name: 'New',
      description: null,
      imageUrl: null,
      sources: [{ shopId: null, sourceUrl: null, price: null, currency: 'EUR' }],
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(createItem).toHaveBeenCalled()
  })
})

describe('useUpdateItem', () => {
  it('calls updateItem with the given id and input', async () => {
    vi.mocked(updateItem).mockResolvedValue({ ...MOCK_ITEM, name: 'Renamed' })
    const { result } = renderHook(() => useUpdateItem(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ id: 'item-1', input: { name: 'Renamed' } })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateItem).toHaveBeenCalled()
    expect(vi.mocked(updateItem).mock.calls[0]?.[0]).toBe('item-1')
    expect(vi.mocked(updateItem).mock.calls[0]?.[1]).toEqual({ name: 'Renamed' })
  })
})

describe('useDeleteItem', () => {
  it('calls deleteItem with the given id', async () => {
    vi.mocked(deleteItem).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteItem(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate('item-1')
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(deleteItem).toHaveBeenCalled()
    expect(vi.mocked(deleteItem).mock.calls[0]?.[0]).toBe('item-1')
  })
})
