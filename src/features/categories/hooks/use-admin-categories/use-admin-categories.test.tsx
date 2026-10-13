import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import {
  buildAdminCategoriesKey,
  buildAdminCategoryKey,
  useAdminCategories,
  useAdminCategory,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from './use-admin-categories'

vi.mock('@/data-access/categories/categories.api', () => ({
  CATEGORIES_QUERY_KEY: ['categories'] as const,
  listAdminCategories: vi.fn(),
  fetchAdminCategory: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import {
  createCategory,
  deleteCategory,
  fetchAdminCategory,
  listAdminCategories,
  updateCategory,
} from '@/data-access/categories/categories.api'

const MOCK_CATEGORY = {
  id: '11111111-1111-1111-1111-111111111111',
  parentId: null,
  name: 'Electronics',
  slug: 'electronics',
  depth: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminCategoriesKey', () => {
  it('produces the expected list key', () => {
    const key = buildAdminCategoriesKey()
    expect(key).toEqual(['categories', 'list'])
  })
})

describe('useAdminCategories', () => {
  it('returns the flat category array on success', async () => {
    vi.mocked(listAdminCategories).mockResolvedValue([MOCK_CATEGORY])
    const { result } = renderHook(() => useAdminCategories(), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.[0]?.slug).toBe('electronics')
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminCategories).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminCategories(), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useAdminCategory', () => {
  it('fetches when id is non-null', async () => {
    vi.mocked(fetchAdminCategory).mockResolvedValue(MOCK_CATEGORY)
    const { result } = renderHook(() => useAdminCategory(MOCK_CATEGORY.id), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(fetchAdminCategory).toHaveBeenCalledWith(MOCK_CATEGORY.id)
  })

  it('is disabled when id is null', async () => {
    vi.mocked(fetchAdminCategory).mockResolvedValue(MOCK_CATEGORY)
    const { result } = renderHook(() => useAdminCategory(null), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
    expect(fetchAdminCategory).not.toHaveBeenCalled()
  })
})

describe('useCreateCategory', () => {
  it('calls createCategory with the given input', async () => {
    vi.mocked(createCategory).mockResolvedValue(MOCK_CATEGORY)
    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ name: 'Phones', slug: 'phones', parentId: null })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(createCategory).toHaveBeenCalled()
    expect(vi.mocked(createCategory).mock.calls[0]?.[0]).toEqual({
      name: 'Phones',
      slug: 'phones',
      parentId: null,
    })
  })
})

describe('useUpdateCategory', () => {
  it('calls updateCategory with the given id and input', async () => {
    vi.mocked(updateCategory).mockResolvedValue({ ...MOCK_CATEGORY, name: 'New' })
    const { result } = renderHook(() => useUpdateCategory(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ id: MOCK_CATEGORY.id, input: { name: 'New' } })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateCategory).toHaveBeenCalled()
    expect(vi.mocked(updateCategory).mock.calls[0]?.[0]).toBe(MOCK_CATEGORY.id)
    expect(vi.mocked(updateCategory).mock.calls[0]?.[1]).toEqual({ name: 'New' })
  })
})

describe('useDeleteCategory', () => {
  it('calls deleteCategory with the given id', async () => {
    vi.mocked(deleteCategory).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteCategory(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate(MOCK_CATEGORY.id)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(deleteCategory).toHaveBeenCalled()
    expect(vi.mocked(deleteCategory).mock.calls[0]?.[0]).toBe(MOCK_CATEGORY.id)
  })
})

describe('buildAdminCategoryKey', () => {
  it('produces the expected detail key', () => {
    const key = buildAdminCategoryKey('abc')
    expect(key).toEqual(['categories', 'detail', 'abc'])
  })
})
