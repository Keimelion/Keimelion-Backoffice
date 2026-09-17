'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PAGE_PARAM } from '@/lib/url-params'

const SORT_DIRECTIONS = ['asc', 'desc'] as const
type SortDirection = typeof SORT_DIRECTIONS[number]
export const [ASC, DESC] = SORT_DIRECTIONS

export interface SortState {
  field: string
  direction: SortDirection
}

interface UseSortParamReturn {
  active: SortState | null
  cycleSort: (field: string) => void
}

const SORT_PARAM = 'sort'
const SORT_PATTERN = new RegExp(`^(.+):(${SORT_DIRECTIONS.join('|')})$`)

function isSortDirection(value: string | undefined): value is SortDirection {
  return value !== undefined && (SORT_DIRECTIONS as readonly string[]).includes(value)
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
  if (active?.field !== field) return ASC
  if (active.direction === ASC) return DESC
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
    if (nextDirection === null) {
      next.delete(SORT_PARAM)
    } else {
      next.set(SORT_PARAM, `${field}:${nextDirection}`)
    }
    router.replace(`?${next.toString()}`, { scroll: false })
  }, [router, searchParams, active])

  return { active, cycleSort }
}
