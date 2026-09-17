'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PAGE_PARAM } from '@/lib/url-params'

type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: string
  direction: SortDirection
}

interface UseSortParamReturn {
  active: SortState | null
  cycleSort: (field: string) => void
}

const SORT_PARAM = 'sort'
const SORT_PATTERN = /^(.+):(asc|desc)$/

function isSortDirection(value: string | undefined): value is SortDirection {
  return value === 'asc' || value === 'desc'
}

function parseSortParam(raw: string | null): SortState | null {
  if (raw === null) return null
  const match = SORT_PATTERN.exec(raw)
  if (match === null) return null
  const field = match[1]
  const direction = match[2]
  if (field === undefined) return null
  if (!isSortDirection(direction)) return null
  return { field, direction }
}

function resolveNextDirection(field: string, active: SortState | null): SortDirection | null {
  if (active?.field !== field) return 'asc'
  if (active.direction === 'asc') return 'desc'
  return null
}

export function useSortParam(): UseSortParamReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const active = parseSortParam(searchParams.get(SORT_PARAM))

  const cycleSort = useCallback((field: string): void => {
    const nextDirection = resolveNextDirection(field, active)
    const next = new URLSearchParams(searchParams.toString())
    next.delete(PAGE_PARAM)
    next.delete(SORT_PARAM)
    if (nextDirection !== null) next.set(SORT_PARAM, `${field}:${nextDirection}`)
    router.replace(`?${next.toString()}`, { scroll: false })
  }, [router, searchParams, active])

  return { active, cycleSort }
}
