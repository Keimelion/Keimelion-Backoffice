import { describe, expect, it } from 'vitest'
import { shareEqualStructure } from './share-equal-structure'

const CREATED_AT = '2024-01-01T00:00:00.000Z'
const UPDATED_AT = '2024-02-01T00:00:00.000Z'

function buildPage(createdAt: string): { items: { id: string; createdAt: Date }[] } {
  return { items: [{ id: 'first', createdAt: new Date(createdAt) }] }
}

describe('shareEqualStructure', () => {
  it('keeps the previous reference when dates hold the same time', () => {
    const previous = buildPage(CREATED_AT)

    expect(shareEqualStructure(previous, buildPage(CREATED_AT))).toBe(previous)
  })

  it('returns new data when a date changes', () => {
    const next = buildPage(UPDATED_AT)

    expect(shareEqualStructure(buildPage(CREATED_AT), next)).toEqual(next)
  })

  it('keeps unchanged siblings when one array entry changes', () => {
    const unchanged = { id: 'unchanged', createdAt: new Date(CREATED_AT) }
    const previous = [unchanged, { id: 'changed', createdAt: new Date(CREATED_AT) }]
    const next = [
      { id: 'unchanged', createdAt: new Date(CREATED_AT) },
      { id: 'changed', createdAt: new Date(UPDATED_AT) },
    ]

    const shared = shareEqualStructure(previous, next) as typeof previous

    expect(shared).not.toBe(previous)
    expect(shared[0]).toBe(unchanged)
  })

  it('detects removed keys and shorter arrays', () => {
    expect(shareEqualStructure({ a: 1, b: 2 }, { a: 1 })).toEqual({ a: 1 })
    expect(shareEqualStructure([1, 2], [1])).toEqual([1])
  })
})
