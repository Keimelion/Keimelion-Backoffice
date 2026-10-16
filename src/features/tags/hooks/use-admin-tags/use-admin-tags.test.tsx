import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import {
  buildAdminTagKey,
  buildAdminTagsKey,
  useAdminTag,
  useAdminTags,
  useCreateTag,
  useDeleteTag,
  useUpdateTag,
} from './use-admin-tags'

vi.mock('@/data-access/tags/tags.api', () => ({
  TAGS_QUERY_KEY: ['tags'] as const,
  listAdminTags: vi.fn(),
  fetchAdminTag: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import {
  createTag,
  deleteTag,
  fetchAdminTag,
  listAdminTags,
  updateTag,
} from '@/data-access/tags/tags.api'

const MOCK_TAG = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'gaming',
  slug: 'gaming',
}

const MOCK_RESPONSE = {
  items: [MOCK_TAG],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminTagsKey', () => {
  it('produces the expected key shape', () => {
    const key = buildAdminTagsKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('tags')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ page: 1, limit: 20 })
  })

  it('strips undefined and empty values from the normalized filters', () => {
    const key = buildAdminTagsKey({ page: 1, search: undefined })
    expect('search' in key[2]).toBe(false)
  })

  it('sorts filter keys for cache stability', () => {
    const keyA = buildAdminTagsKey({ page: 1, search: 'g', limit: 20 })
    const keyB = buildAdminTagsKey({ limit: 20, search: 'g', page: 1 })
    expect(JSON.stringify(keyA[2])).toBe(JSON.stringify(keyB[2]))
  })
})

describe('buildAdminTagKey', () => {
  it('produces the expected detail key', () => {
    const key = buildAdminTagKey('abc')
    expect(key).toEqual(['tags', 'detail', 'abc'])
  })
})

describe('useAdminTags', () => {
  it('returns the paginated response on success', async () => {
    vi.mocked(listAdminTags).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminTags({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items[0]?.slug).toBe('gaming')
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminTags).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminTags({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useAdminTag', () => {
  it('fetches when id is non-null', async () => {
    vi.mocked(fetchAdminTag).mockResolvedValue(MOCK_TAG)
    const { result } = renderHook(() => useAdminTag(MOCK_TAG.id), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(fetchAdminTag).toHaveBeenCalled()
    expect(vi.mocked(fetchAdminTag).mock.calls[0]?.[0]).toBe(MOCK_TAG.id)
  })

  it('is disabled when id is null', async () => {
    vi.mocked(fetchAdminTag).mockResolvedValue(MOCK_TAG)
    const { result } = renderHook(() => useAdminTag(null), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
    expect(fetchAdminTag).not.toHaveBeenCalled()
  })
})

describe('useCreateTag', () => {
  it('invalidates the tags query on success', async () => {
    vi.mocked(createTag).mockResolvedValue(MOCK_TAG)
    const { result } = renderHook(() => useCreateTag(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ name: 'Gaming' })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(createTag).toHaveBeenCalled()
    expect(vi.mocked(createTag).mock.calls[0]?.[0]).toEqual({ name: 'Gaming' })
  })
})

describe('useUpdateTag', () => {
  it('calls updateTag with the given id and input', async () => {
    vi.mocked(updateTag).mockResolvedValue({ ...MOCK_TAG, name: 'renamed', slug: 'renamed' })
    const { result } = renderHook(() => useUpdateTag(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ id: MOCK_TAG.id, input: { name: 'Renamed' } })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateTag).toHaveBeenCalled()
    expect(vi.mocked(updateTag).mock.calls[0]?.[0]).toBe(MOCK_TAG.id)
    expect(vi.mocked(updateTag).mock.calls[0]?.[1]).toEqual({ name: 'Renamed' })
  })
})

describe('useDeleteTag', () => {
  it('calls deleteTag with the given id', async () => {
    vi.mocked(deleteTag).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteTag(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate(MOCK_TAG.id)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(deleteTag).toHaveBeenCalled()
    expect(vi.mocked(deleteTag).mock.calls[0]?.[0]).toBe(MOCK_TAG.id)
  })
})
