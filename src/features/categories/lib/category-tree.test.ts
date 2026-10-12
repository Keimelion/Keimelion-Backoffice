import { describe, expect, it } from 'vitest'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import {
  buildParentPathLabel,
  collectDescendantIds,
  countDescendants,
} from './category-tree'

function makeCategory(id: string, parentId: string | null, name: string, depth: number): ApiCategory {
  return {
    id,
    parentId,
    name,
    slug: name.toLowerCase(),
    depth,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }
}

const ROOT = makeCategory('root', null, 'Electronics', 0)
const CHILD_A = makeCategory('child-a', 'root', 'Phones', 1)
const CHILD_B = makeCategory('child-b', 'root', 'Laptops', 1)
const GRANDCHILD = makeCategory('grandchild', 'child-a', 'Smartphones', 2)
const UNRELATED = makeCategory('unrelated', null, 'Books', 0)

const CATEGORIES: ApiCategory[] = [ROOT, CHILD_A, CHILD_B, GRANDCHILD, UNRELATED]

describe('collectDescendantIds', () => {
  it('returns an empty set for a leaf category', () => {
    const descendants = collectDescendantIds('grandchild', CATEGORIES)
    expect(descendants.size).toBe(0)
  })

  it('returns direct children and transitive descendants', () => {
    const descendants = collectDescendantIds('root', CATEGORIES)
    expect(descendants).toEqual(new Set(['child-a', 'child-b', 'grandchild']))
  })

  it('does not include the root id itself', () => {
    const descendants = collectDescendantIds('root', CATEGORIES)
    expect(descendants.has('root')).toBe(false)
  })

  it('does not include unrelated categories', () => {
    const descendants = collectDescendantIds('root', CATEGORIES)
    expect(descendants.has('unrelated')).toBe(false)
  })
})

describe('countDescendants', () => {
  it('counts all descendants', () => {
    expect(countDescendants('root', CATEGORIES)).toBe(3)
  })

  it('returns 0 for a leaf', () => {
    expect(countDescendants('grandchild', CATEGORIES)).toBe(0)
  })
})

describe('buildParentPathLabel', () => {
  it('returns just the name for a root category', () => {
    expect(buildParentPathLabel(ROOT, CATEGORIES)).toBe('Electronics')
  })

  it('prefixes with the parent name', () => {
    expect(buildParentPathLabel(CHILD_A, CATEGORIES)).toBe('Electronics / Phones')
  })

  it('builds the full path for a nested category', () => {
    expect(buildParentPathLabel(GRANDCHILD, CATEGORIES)).toBe('Electronics / Phones / Smartphones')
  })
})
