import { describe, expect, it } from 'vitest'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import {
  buildCategoryForest,
  buildParentPathLabel,
  collectAncestorIds,
  collectDescendantIds,
  computeDropDisabledReason,
  countDescendants,
  evaluateDrop,
  getSubtreeMaxDepth,
  type CategoryNode,
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

describe('buildCategoryForest', () => {
  it('groups categories under their parent and sorts siblings alphabetically', () => {
    const forest = buildCategoryForest(CATEGORIES)
    expect(forest.map((node) => node.category.id)).toEqual(['unrelated', 'root'])
    const rootNode = forest.find((node) => node.category.id === 'root')
    expect(rootNode?.children.map((node) => node.category.id)).toEqual(['child-b', 'child-a'])
    const childA = rootNode?.children.find((node) => node.category.id === 'child-a')
    expect(childA?.children.map((node) => node.category.id)).toEqual(['grandchild'])
  })

  it('promotes orphan categories to roots when their parent is missing', () => {
    const forest = buildCategoryForest([CHILD_A])
    expect(forest.map((node) => node.category.id)).toEqual(['child-a'])
  })
})

describe('getSubtreeMaxDepth', () => {
  it('returns the category depth for a leaf', () => {
    const forest = buildCategoryForest(CATEGORIES)
    const grandchildNode = forest
      .find((node) => node.category.id === 'root')
      ?.children.find((node) => node.category.id === 'child-a')
      ?.children.find((node) => node.category.id === 'grandchild')
    if (grandchildNode === undefined) throw new Error('grandchild missing from forest')
    expect(getSubtreeMaxDepth(grandchildNode)).toBe(2)
  })

  it('returns the deepest descendant depth for a subtree root', () => {
    const forest = buildCategoryForest(CATEGORIES)
    const rootNode = forest.find((node) => node.category.id === 'root')
    if (rootNode === undefined) throw new Error('root missing from forest')
    expect(getSubtreeMaxDepth(rootNode)).toBe(2)
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

describe('collectAncestorIds', () => {
  it('returns empty set for a root category', () => {
    expect(collectAncestorIds('root', CATEGORIES)).toEqual(new Set())
  })

  it('returns the immediate parent for a depth-1 category', () => {
    expect(collectAncestorIds('child-a', CATEGORIES)).toEqual(new Set(['root']))
  })

  it('returns the full ancestor chain for a depth-2 category', () => {
    expect(collectAncestorIds('grandchild', CATEGORIES)).toEqual(new Set(['child-a', 'root']))
  })

  it('returns empty set when the id is unknown', () => {
    expect(collectAncestorIds('ghost', CATEGORIES)).toEqual(new Set())
  })
})

describe('computeDropDisabledReason', () => {
  const BASE_ARGS = {
    nodeId: 'child-a',
    newParentDepth: 1,
    activeDragId: 'unrelated',
    activeDescendantIds: new Set<string>(),
    activeSubtreeMaxDepth: 0,
    activeOriginalDepth: 0,
  }

  it('returns null when no drag is active', () => {
    expect(computeDropDisabledReason({ ...BASE_ARGS, activeDragId: null })).toBe(null)
  })

  it('returns "self" when dropping onto the dragged node', () => {
    expect(
      computeDropDisabledReason({ ...BASE_ARGS, nodeId: 'root', activeDragId: 'root' }),
    ).toBe('self')
  })

  it('returns "cycle" when dropping onto a descendant of the dragged node', () => {
    expect(
      computeDropDisabledReason({
        ...BASE_ARGS,
        nodeId: 'grandchild',
        activeDescendantIds: new Set(['grandchild']),
      }),
    ).toBe('cycle')
  })

  it('returns "max_depth" when the move would push the subtree past the cap', () => {
    expect(
      computeDropDisabledReason({
        ...BASE_ARGS,
        newParentDepth: 2,
        activeSubtreeMaxDepth: 2,
        activeOriginalDepth: 0,
      }),
    ).toBe('max_depth')
  })

  it('returns null when the drop is valid', () => {
    expect(computeDropDisabledReason(BASE_ARGS)).toBe(null)
  })
})

describe('evaluateDrop', () => {
  const forest = buildCategoryForest(CATEGORIES)
  const nodeById = new Map<string, CategoryNode>()
  const stack: CategoryNode[] = [...forest]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node === undefined) continue
    nodeById.set(node.category.id, node)
    for (const child of node.children) stack.push(child)
  }

  function getNode(id: string): CategoryNode {
    const node = nodeById.get(id)
    if (node === undefined) throw new Error(`missing node ${id} in test setup`)
    return node
  }

  it('rejects dropping onto the dragged node itself', () => {
    expect(
      evaluateDrop({
        dragged: getNode('root'),
        newParentId: 'root',
        nodeById,
        categories: CATEGORIES,
      }),
    ).toEqual({ kind: 'invalid', reason: 'self' })
  })

  it('rejects dropping onto a descendant', () => {
    expect(
      evaluateDrop({
        dragged: getNode('root'),
        newParentId: 'child-a',
        nodeById,
        categories: CATEGORIES,
      }),
    ).toEqual({ kind: 'invalid', reason: 'cycle' })
  })

  it('rejects a move whose subtree would exceed the max depth', () => {
    expect(
      evaluateDrop({
        dragged: getNode('root'),
        newParentId: 'unrelated',
        nodeById,
        categories: CATEGORIES,
      }),
    ).toEqual({ kind: 'invalid', reason: 'max_depth' })
  })

  it('accepts a valid promotion to root (null parent)', () => {
    expect(
      evaluateDrop({
        dragged: getNode('child-a'),
        newParentId: null,
        nodeById,
        categories: CATEGORIES,
      }),
    ).toEqual({ kind: 'valid' })
  })

  it('accepts a valid reparent that fits under the max depth', () => {
    expect(
      evaluateDrop({
        dragged: getNode('child-a'),
        newParentId: 'unrelated',
        nodeById,
        categories: CATEGORIES,
      }),
    ).toEqual({ kind: 'valid' })
  })
})
