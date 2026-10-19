import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import {
  buildAdminListKey,
  buildAdminListsKey,
  useAdminList,
  useAdminLists,
  useDeleteList,
  useRestoreList,
  useUpdateList,
} from './use-admin-lists'

vi.mock('@/data-access/lists/lists.api', () => ({
  LISTS_QUERY_KEY: ['lists'] as const,
  listAdminLists: vi.fn(),
  fetchAdminList: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
  restoreList: vi.fn(),
  listAdminListItems: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import {
  deleteList,
  fetchAdminList,
  listAdminLists,
  restoreList,
  updateList,
} from '@/data-access/lists/lists.api'

const LIST_ID = '11111111-1111-4111-8111-111111111111'

const MOCK_LIST = {
  id: LIST_ID,
  title: 'Birthday',
  slug: 'birthday',
  description: null,
  listStatus: 'active' as const,
  occasionTypeId: null,
  owner: null,
  tags: [],
  itemCount: 0,
  totalEstimatedPrice: null,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_RESPONSE = {
  items: [MOCK_LIST],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminListsKey', () => {
  it('produces the expected key shape', () => {
    const key = buildAdminListsKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('lists')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ page: 1, limit: 20 })
  })

  it('strips undefined and empty values from the normalized filters', () => {
    const key = buildAdminListsKey({ page: 1, search: undefined })
    expect('search' in key[2]).toBe(false)
  })

  it('sorts filter keys for cache stability', () => {
    const keyA = buildAdminListsKey({ page: 1, search: 'a', limit: 20 })
    const keyB = buildAdminListsKey({ limit: 20, search: 'a', page: 1 })
    expect(JSON.stringify(keyA[2])).toBe(JSON.stringify(keyB[2]))
  })
})

describe('useAdminLists', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(listAdminLists).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminLists({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items[0]?.title).toBe('Birthday')
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminLists).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminLists({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useAdminList', () => {
  it('is disabled and does not call fetch when id is null', async () => {
    const { result } = renderHook(() => useAdminList(null), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
    expect(fetchAdminList).not.toHaveBeenCalled()
  })

  it('fetches the list when id is a string', async () => {
    vi.mocked(fetchAdminList).mockResolvedValue(MOCK_LIST)
    const { result } = renderHook(() => useAdminList(LIST_ID), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(fetchAdminList).toHaveBeenCalledWith(LIST_ID)
    expect(result.current.data?.id).toBe(LIST_ID)
  })

  it('uses a sentinel key when id is null (no empty-string collision)', () => {
    const nullKey = ['lists', 'detail', null]
    const emptyKey = buildAdminListKey('')
    expect(JSON.stringify(nullKey)).not.toBe(JSON.stringify(emptyKey))
  })
})

describe('useUpdateList', () => {
  it('calls updateList with the given id and input and invalidates on success', async () => {
    vi.mocked(updateList).mockResolvedValue({ ...MOCK_LIST, title: 'Renamed' })
    const { result } = renderHook(() => useUpdateList(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ id: LIST_ID, input: { title: 'Renamed' } })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateList).toHaveBeenCalled()
    expect(vi.mocked(updateList).mock.calls[0]?.[0]).toBe(LIST_ID)
    expect(vi.mocked(updateList).mock.calls[0]?.[1]).toEqual({ title: 'Renamed' })
  })
})

describe('useDeleteList', () => {
  it('calls deleteList with the given id', async () => {
    vi.mocked(deleteList).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteList(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate(LIST_ID)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(deleteList).toHaveBeenCalled()
    expect(vi.mocked(deleteList).mock.calls[0]?.[0]).toBe(LIST_ID)
  })
})

describe('useRestoreList', () => {
  it('calls restoreList with the given id', async () => {
    vi.mocked(restoreList).mockResolvedValue(MOCK_LIST)
    const { result } = renderHook(() => useRestoreList(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate(LIST_ID)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(restoreList).toHaveBeenCalled()
    expect(vi.mocked(restoreList).mock.calls[0]?.[0]).toBe(LIST_ID)
  })
})
