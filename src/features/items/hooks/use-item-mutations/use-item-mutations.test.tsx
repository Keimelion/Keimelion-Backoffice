import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useCreateItem, useRestoreItem, useSoftDeleteItem, useUpdateItem } from './use-item-mutations'

vi.mock(import('@/data-access/items/items.api'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createItem: vi.fn(),
    updateItem: vi.fn(),
    softDeleteItem: vi.fn(),
    restoreItem: vi.fn(),
  }
})

import { createItem, restoreItem, softDeleteItem, updateItem } from '@/data-access/items/items.api'

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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCreateItem', () => {
  it('calls createItem and resolves with the created item', async () => {
    vi.mocked(createItem).mockResolvedValue(MOCK_ITEM)
    const { result } = renderHook(() => useCreateItem(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Espresso machine',
        description: null,
        imageUrl: null,
        moderationStatus: 'approved',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(createItem).toHaveBeenCalledWith(
      {
        name: 'Espresso machine',
        description: null,
        imageUrl: null,
        moderationStatus: 'approved',
      },
      expect.anything(),
    )
  })
})

describe('useUpdateItem', () => {
  it('calls updateItem with the id and input', async () => {
    vi.mocked(updateItem).mockResolvedValue(MOCK_ITEM)
    const { result } = renderHook(() => useUpdateItem(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'item-1',
        input: { name: 'Updated', description: null, imageUrl: null, moderationStatus: 'approved' },
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateItem).toHaveBeenCalledWith('item-1', {
      name: 'Updated',
      description: null,
      imageUrl: null,
      moderationStatus: 'approved',
    })
  })
})

describe('useSoftDeleteItem', () => {
  it('calls softDeleteItem with the id', async () => {
    vi.mocked(softDeleteItem).mockResolvedValue(undefined)
    const { result } = renderHook(() => useSoftDeleteItem(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await result.current.mutateAsync('item-1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(softDeleteItem).toHaveBeenCalledWith('item-1', expect.anything())
  })

  it('rejects when the API returns a conflict', async () => {
    vi.mocked(softDeleteItem).mockRejectedValue(new Error('Item referenced by 3 list_items'))
    const { result } = renderHook(() => useSoftDeleteItem(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await expect(result.current.mutateAsync('item-1')).rejects.toThrow('Item referenced by 3 list_items')
    })
  })
})

describe('useRestoreItem', () => {
  it('calls restoreItem with the id', async () => {
    vi.mocked(restoreItem).mockResolvedValue(MOCK_ITEM)
    const { result } = renderHook(() => useRestoreItem(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await result.current.mutateAsync('item-1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(restoreItem).toHaveBeenCalledWith('item-1', expect.anything())
  })
})
