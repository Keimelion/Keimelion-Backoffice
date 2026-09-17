import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replaceMock = vi.fn()
const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

import { useSortParam } from './use-sort-param'

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

function lastCalledUrl(): string {
  return replaceMock.mock.calls.at(-1)?.[0] as string
}

describe('useSortParam', () => {
  describe('parsing', () => {
    it('returns null fields when no sort param is present', () => {
      const { result } = renderHook(() => useSortParam())
      expect(result.current.activeField).toBeNull()
      expect(result.current.activeDirection).toBeNull()
    })

    it('parses sort=field:asc correctly', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=email:asc'))
      const { result } = renderHook(() => useSortParam())
      expect(result.current.activeField).toBe('email')
      expect(result.current.activeDirection).toBe('asc')
    })

    it('parses sort=field:desc correctly', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=createdAt:desc'))
      const { result } = renderHook(() => useSortParam())
      expect(result.current.activeField).toBe('createdAt')
      expect(result.current.activeDirection).toBe('desc')
    })

    it('ignores garbage sort values and returns null fields', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=notvalid'))
      const { result } = renderHook(() => useSortParam())
      expect(result.current.activeField).toBeNull()
      expect(result.current.activeDirection).toBeNull()
    })

    it('ignores invalid direction in sort value', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=field:sideways'))
      const { result } = renderHook(() => useSortParam())
      expect(result.current.activeField).toBeNull()
      expect(result.current.activeDirection).toBeNull()
    })
  })

  describe('cycleSort', () => {
    it('sets sort=field:asc when column is unsorted', () => {
      const { result } = renderHook(() => useSortParam())
      act(() => { result.current.cycleSort('email') })
      expect(lastCalledUrl()).toContain('sort=email%3Aasc')
    })

    it('toggles to desc after asc on the same column', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=email:asc'))
      const { result } = renderHook(() => useSortParam())
      act(() => { result.current.cycleSort('email') })
      expect(lastCalledUrl()).toContain('sort=email%3Adesc')
    })

    it('removes sort param after desc on the same column', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=email:desc'))
      const { result } = renderHook(() => useSortParam())
      act(() => { result.current.cycleSort('email') })
      expect(lastCalledUrl()).not.toContain('sort=')
    })

    it('resets to asc when clicking a different column', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=email:desc'))
      const { result } = renderHook(() => useSortParam())
      act(() => { result.current.cycleSort('username') })
      expect(lastCalledUrl()).toContain('sort=username%3Aasc')
    })

    it('deletes page param on every sort write', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=email:asc&page=3'))
      const { result } = renderHook(() => useSortParam())
      act(() => { result.current.cycleSort('email') })
      expect(lastCalledUrl()).not.toContain('page=')
    })

    it('calls router.replace with { scroll: false }', () => {
      const { result } = renderHook(() => useSortParam())
      act(() => { result.current.cycleSort('email') })
      expect(replaceMock.mock.calls.at(-1)?.[1]).toEqual({ scroll: false })
    })

    it('preserves unrelated query params on sort write', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo@bar.com'))
      const { result } = renderHook(() => useSortParam())
      act(() => { result.current.cycleSort('username') })
      expect(lastCalledUrl()).toContain('email=')
    })
  })
})
