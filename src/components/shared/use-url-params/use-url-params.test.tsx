import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replaceMock = vi.fn()
const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

import { useUrlParams } from './use-url-params'

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

function lastCalledUrl(): string {
  return replaceMock.mock.calls.at(-1)?.[0] as string
}

describe('useUrlParams', () => {
  describe('setFilterParam', () => {
    it('sets the param and calls router.replace with { scroll: false }', () => {
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.setFilterParam('email', 'foo@bar.com') })
      expect(lastCalledUrl()).toContain('email=foo%40bar.com')
      expect(replaceMock.mock.calls.at(-1)?.[1]).toEqual({ scroll: false })
    })

    it('deletes the param when value is null', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo'))
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.setFilterParam('email', null) })
      expect(lastCalledUrl()).not.toContain('email=')
    })

    it('deletes the param when value is empty string', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo'))
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.setFilterParam('email', '') })
      expect(lastCalledUrl()).not.toContain('email=')
    })

    it('resets page to remove pagination on filter change', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('page=3'))
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.setFilterParam('email', 'x') })
      expect(lastCalledUrl()).not.toContain('page=')
    })

    it('preserves unrelated params', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=createdAt:desc'))
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.setFilterParam('email', 'x') })
      expect(lastCalledUrl()).toContain('sort=')
    })
  })

  describe('setPage', () => {
    it('sets the page param without touching other params', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo'))
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.setPage(2) })
      const url = lastCalledUrl()
      expect(url).toContain('page=2')
      expect(url).toContain('email=foo')
    })
  })

  describe('clearParams', () => {
    it('deletes every listed param plus page', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo&role=admin&page=2'))
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.clearParams(['email', 'role']) })
      const url = lastCalledUrl()
      expect(url).not.toContain('email=')
      expect(url).not.toContain('role=')
      expect(url).not.toContain('page=')
    })

    it('does not touch params outside the list', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo&sort=createdAt:desc'))
      const { result } = renderHook(() => useUrlParams())
      act(() => { result.current.clearParams(['email']) })
      expect(lastCalledUrl()).toContain('sort=')
    })
  })
})
