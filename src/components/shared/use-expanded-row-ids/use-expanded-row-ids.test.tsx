import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useExpandedRowIds } from './use-expanded-row-ids'

const FIRST_ROW = { id: 'first' }
const SECOND_ROW = { id: 'second' }

describe('useExpandedRowIds', () => {
  it('toggles a row id on and off', () => {
    const rows = [FIRST_ROW]
    const { result } = renderHook(() => useExpandedRowIds(rows))

    act(() => { result.current.toggleExpanded(FIRST_ROW.id) })
    expect(result.current.expandedIds.has(FIRST_ROW.id)).toBe(true)

    act(() => { result.current.toggleExpanded(FIRST_ROW.id) })
    expect(result.current.expandedIds.has(FIRST_ROW.id)).toBe(false)
  })

  it('drops expanded ids that are no longer visible', () => {
    const { result, rerender } = renderHook(
      ({ rows }) => useExpandedRowIds(rows),
      { initialProps: { rows: [FIRST_ROW, SECOND_ROW] } },
    )
    act(() => { result.current.toggleExpanded(FIRST_ROW.id) })
    act(() => { result.current.toggleExpanded(SECOND_ROW.id) })

    rerender({ rows: [SECOND_ROW] })

    expect([...result.current.expandedIds]).toEqual([SECOND_ROW.id])
  })
})
