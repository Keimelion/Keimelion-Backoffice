import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/query-test-utils'
import { useOccasionTypes, OCCASION_TYPES_QUERY_KEY } from './use-occasion-types'

vi.mock('@/data-access/occasion-types/occasion-types.api', () => ({
  fetchOccasionTypes: vi.fn(),
}))

import { fetchOccasionTypes } from '@/data-access/occasion-types/occasion-types.api'

const MOCK_OCCASION_TYPES = [
  { id: '1', slug: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: '2', slug: 'wedding', label: 'Wedding', emoji: null },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useOccasionTypes', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(fetchOccasionTypes).mockResolvedValue(MOCK_OCCASION_TYPES)
    const { result } = renderHook(() => useOccasionTypes(), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.slug).toBe('birthday')
  })

  it('handles null emoji gracefully', async () => {
    vi.mocked(fetchOccasionTypes).mockResolvedValue(MOCK_OCCASION_TYPES)
    const { result } = renderHook(() => useOccasionTypes(), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.[1]?.emoji).toBeNull()
  })

  it('exposes isError on fetch failure', async () => {
    vi.mocked(fetchOccasionTypes).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useOccasionTypes(), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.error?.message).toBe('Network error')
  })

  it('returns empty array when API returns empty list', async () => {
    vi.mocked(fetchOccasionTypes).mockResolvedValue([])
    const { result } = renderHook(() => useOccasionTypes(), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data).toHaveLength(0)
  })
})

describe('OCCASION_TYPES_QUERY_KEY', () => {
  it('has the expected shape', () => {
    expect(OCCASION_TYPES_QUERY_KEY[0]).toBe('occasion-types')
    expect(OCCASION_TYPES_QUERY_KEY[1]).toBe('list')
  })
})
