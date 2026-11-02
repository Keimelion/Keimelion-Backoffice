'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PAGE_PARAM } from '@/lib/url-params'

export const ASC = 'asc'
export const DESC = 'desc'
export type SortDirection = typeof ASC | typeof DESC

export interface SortState {
  field: string
  direction: SortDirection
}

interface UseSortParamReturn {
  active: SortState | null
  cycleSort: (field: string) => void
}

const SORT_PARAM = 'sort'
const SORT_PATTERN = new RegExp(`^(.+):(${ASC}|${DESC})$`)

function isSortDirection(value: string | undefined): value is SortDirection {
  return value === ASC || value === DESC
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

function resolveNextDirection(current: SortDirection | null): SortDirection | null {
  if (current === null) return ASC
  if (current === ASC) return DESC
  return null
}

export function useSortParam(): UseSortParamReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const active = parseSortParam(searchParams.get(SORT_PARAM))

  const cycleSort = useCallback((field: string): void => {
    const currentDirection = active?.field === field ? active.direction : null
    const nextDirection = resolveNextDirection(currentDirection)
    const next = new URLSearchParams(searchParams.toString())
    next.delete(PAGE_PARAM)
    next.delete(SORT_PARAM)
    if (nextDirection !== null) next.set(SORT_PARAM, `${field}:${nextDirection}`)
    router.replace(`?${next.toString()}`, { scroll: false })
  }, [router, searchParams, active])

  return { active, cycleSort }
}
