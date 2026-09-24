import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useCreateItemSource, useDeleteItemSource, useUpdateItemSource } from './use-item-source-mutations'

vi.mock(import('@/data-access/items/item-sources.api'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createItemSource: vi.fn(),
    updateItemSource: vi.fn(),
    deleteItemSource: vi.fn(),
  }
})

import { createItemSource, deleteItemSource, updateItemSource } from '@/data-access/items/item-sources.api'

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

describe('useCreateItemSource', () => {
  it('calls createItemSource with the item id and input', async () => {
    vi.mocked(createItemSource).mockResolvedValue(MOCK_SOURCE)
    const { result } = renderHook(() => useCreateItemSource(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        itemId: 'item-1',
        input: { shopId: null, sourceUrl: 'https://shop.example.com/product', price: '19.99', currency: 'EUR', isPrimary: true },
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(createItemSource).toHaveBeenCalledWith('item-1', {
      shopId: null,
      sourceUrl: 'https://shop.example.com/product',
      price: '19.99',
      currency: 'EUR',
      isPrimary: true,
    })
  })
})

describe('useUpdateItemSource', () => {
  it('calls updateItemSource with the item id, source id and input', async () => {
    vi.mocked(updateItemSource).mockResolvedValue(MOCK_SOURCE)
    const { result } = renderHook(() => useUpdateItemSource(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        itemId: 'item-1',
        sourceId: 'source-1',
        input: { shopId: null, sourceUrl: 'https://shop.example.com/product', price: '9.99', currency: 'EUR', isPrimary: false },
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateItemSource).toHaveBeenCalledWith('item-1', 'source-1', {
      shopId: null,
      sourceUrl: 'https://shop.example.com/product',
      price: '9.99',
      currency: 'EUR',
      isPrimary: false,
    })
  })
})

describe('useDeleteItemSource', () => {
  it('calls deleteItemSource with the item id and source id', async () => {
    vi.mocked(deleteItemSource).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteItemSource(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ itemId: 'item-1', sourceId: 'source-1' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(deleteItemSource).toHaveBeenCalledWith('item-1', 'source-1')
  })

  it('rejects on an IDOR mismatch (404)', async () => {
    vi.mocked(deleteItemSource).mockRejectedValue(new Error('Not found'))
    const { result } = renderHook(() => useDeleteItemSource(), { wrapper: createQueryClientWrapper() })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ itemId: 'item-1', sourceId: 'wrong-source' }),
      ).rejects.toThrow('Not found')
    })
  })
})
