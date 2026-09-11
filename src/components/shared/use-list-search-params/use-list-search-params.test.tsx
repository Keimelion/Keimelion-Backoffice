import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { z } from 'zod'

const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParamsMock(),
}))

import { useListSearchParams } from './use-list-search-params'

const ROLE_VALUES = ['user', 'moderator', 'admin'] as const

const testSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  role: z.enum(ROLE_VALUES).optional(),
})

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

describe('useListSearchParams', () => {
  it('returns parsed values for valid input', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams({ page: '2', role: 'admin' }))
    const { result } = renderHook(() => useListSearchParams(testSchema))
    expect(result.current.page).toBe(2)
    expect(result.current.role).toBe('admin')
  })

  it('falls back to default when page is invalid', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams({ page: 'abc' }))
    const { result } = renderHook(() => useListSearchParams(testSchema))
    expect(result.current.page).toBe(1)
  })

  it('ignores unknown role values and returns undefined', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams({ role: 'superuser' }))
    const { result } = renderHook(() => useListSearchParams(testSchema))
    expect(result.current.role).toBeUndefined()
  })

  it('uses defaults when no params are present', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams())
    const { result } = renderHook(() => useListSearchParams(testSchema))
    expect(result.current.page).toBe(1)
    expect(result.current.role).toBeUndefined()
  })
})
