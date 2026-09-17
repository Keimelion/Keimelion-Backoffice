'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PAGE_PARAM } from '@/lib/url-params'

type SortDirection = 'asc' | 'desc'

interface SortState {
  field: string
  direction: SortDirection
}

interface UseSortParamReturn {
  activeField: string | null
  activeDirection: SortDirection | null
  cycleSort: (field: string) => void
}

const SORT_PARAM = 'sort'
const SORT_PATTERN = /^(.+):(asc|desc)$/

function parseSortParam(raw: string): SortState | null {
  const match = SORT_PATTERN.exec(raw)
  if (match === null) return null
  const field = match[1]
  const direction = match[2]
  if (field === undefined) return null
  if (direction !== 'asc' && direction !== 'desc') return null
  return { field, direction }
}

function resolveNextDirection(
  field: string,
  activeField: string | null,
  activeDirection: SortDirection | null,
): SortDirection | null {
  if (activeField !== field) return 'asc'
  if (activeDirection === 'asc') return 'desc'
  return null
}

export function useSortParam(): UseSortParamReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawSort = searchParams.get(SORT_PARAM)
  const parsed = rawSort !== null ? parseSortParam(rawSort) : null

  const activeField = parsed?.field ?? null
  const activeDirection = parsed?.direction ?? null

  const cycleSort = useCallback((field: string): void => {
    const nextDirection = resolveNextDirection(field, activeField, activeDirection)
    const next = new URLSearchParams(searchParams.toString())
    next.delete(PAGE_PARAM)
    if (nextDirection === null) {
      next.delete(SORT_PARAM)
    } else {
      next.set(SORT_PARAM, `${field}:${nextDirection}`)
    }
    router.replace(`?${next.toString()}`, { scroll: false })
  }, [router, searchParams, activeField, activeDirection])

  return { activeField, activeDirection, cycleSort }
}
