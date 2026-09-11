'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PAGE_PARAM } from '@/lib/url-params'

interface UseUrlParamsReturn {
  searchParams: URLSearchParams
  setFilterParam: (name: string, value: string | null) => void
  setPage: (page: number) => void
  clearParams: (names: string[]) => void
}

export function useUrlParams(): UseUrlParamsReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = useCallback((mutate: (params: URLSearchParams) => void): void => {
    const next = new URLSearchParams(searchParams.toString())
    mutate(next)
    router.replace(`?${next.toString()}`, { scroll: false })
  }, [router, searchParams])

  const setFilterParam = useCallback((name: string, value: string | null): void => {
    updateParams((params) => {
      params.delete(name)
      if (value !== null && value.length > 0) params.set(name, value)
      params.delete(PAGE_PARAM)
    })
  }, [updateParams])

  const setPage = useCallback((page: number): void => {
    updateParams((params) => {
      params.set(PAGE_PARAM, String(page))
    })
  }, [updateParams])

  const clearParams = useCallback((names: string[]): void => {
    updateParams((params) => {
      for (const name of names) params.delete(name)
      params.delete(PAGE_PARAM)
    })
  }, [updateParams])

  return { searchParams, setFilterParam, setPage, clearParams }
}
