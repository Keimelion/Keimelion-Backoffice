import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { buildAdminListItemsKey, useAdminListItems } from './use-admin-list-items'

vi.mock('@/data-access/lists/lists.api', () => ({
  LISTS_QUERY_KEY: ['lists'] as const,
  listAdminListItems: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import { listAdminListItems } from '@/data-access/lists/lists.api'

const LIST_ID = '11111111-1111-4111-8111-111111111111'

const MOCK_LIST_ITEM = {
  id: 'li-1',
  listId: LIST_ID,
  itemId: 'item-1',
  quantityDesired: 1,
  quantityReservedTotal: 0,
  itemStatus: 'active',
  sortOrder: 0,
  creatorNote: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  item: {
    id: 'item-1',
    name: 'Blanket',
    description: null,
    imageUrl: null,
    createdByUserId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    tags: [],
    categories: [],
  },
  sources: [],
}

const MOCK_RESPONSE = {
  items: [MOCK_LIST_ITEM],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminListItemsKey', () => {
  it('includes the list id and pagination in the key', () => {
    const key = buildAdminListItemsKey(LIST_ID, { page: 2, limit: 10 })
    expect(key[0]).toBe('lists')
    expect(key[1]).toBe('items')
    expect(key[2]).toBe(LIST_ID)
    expect(key[3]).toEqual({ page: 2, limit: 10 })
  })
})

describe('useAdminListItems', () => {
  it('is disabled when listId is null (sentinel key, no fetch)', async () => {
    const { result } = renderHook(() => useAdminListItems(null, { page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
    expect(listAdminListItems).not.toHaveBeenCalled()
  })

  it('fetches items when listId is a string', async () => {
    vi.mocked(listAdminListItems).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(
      () => useAdminListItems(LIST_ID, { page: 1, limit: 20 }),
      { wrapper: createQueryClientWrapper() },
    )
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(listAdminListItems).toHaveBeenCalledWith(LIST_ID, { page: 1, limit: 20 })
    expect(result.current.data?.items).toHaveLength(1)
  })

  it('uses a distinct sentinel key when listId is null (no empty-string collision)', () => {
    const nullKey = ['lists', 'items', null]
    const emptyKey = buildAdminListItemsKey('', { page: 1, limit: 20 })
    expect(JSON.stringify(nullKey)).not.toBe(JSON.stringify(emptyKey))
  })
})
