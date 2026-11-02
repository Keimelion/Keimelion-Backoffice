'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface UseReorderModeReturn {
  isReorderMode: boolean
  enterReorderMode: () => void
  exitReorderMode: () => void
}

const REORDER_PARAM = 'reorder'
const REORDER_ACTIVE_VALUE = '1'
const SORT_PARAM = 'sort'
const REORDER_SORT_VALUE = 'sortOrder:asc'

export function useReorderMode(): UseReorderModeReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isReorderMode = searchParams.get(REORDER_PARAM) === REORDER_ACTIVE_VALUE

  const enterReorderMode = (): void => {
    const next = new URLSearchParams()
    next.set(REORDER_PARAM, REORDER_ACTIVE_VALUE)
    next.set(SORT_PARAM, REORDER_SORT_VALUE)
    router.replace(`?${next.toString()}`, { scroll: false })
  }

  const exitReorderMode = (): void => {
    router.replace('?', { scroll: false })
  }

  return { isReorderMode, enterReorderMode, exitReorderMode }
}
