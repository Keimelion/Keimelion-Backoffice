'use client'

import { useEffect, useMemo, useState } from 'react'

interface UseExpandedRowIdsReturn {
  expandedIds: ReadonlySet<string>
  toggleExpanded: (rowId: string) => void
}

export function useExpandedRowIds(visibleRows: readonly { id: string }[]): UseExpandedRowIdsReturn {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set())
  const visibleIds = useMemo(() => new Set(visibleRows.map((row) => row.id)), [visibleRows])

  useEffect(() => {
    setExpandedIds((previous) => {
      const kept = [...previous].filter((id) => visibleIds.has(id))
      return kept.length === previous.size ? previous : new Set(kept)
    })
  }, [visibleIds])

  function toggleExpanded(rowId: string): void {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.delete(rowId)) return next
      return next.add(rowId)
    })
  }

  return { expandedIds, toggleExpanded }
}
