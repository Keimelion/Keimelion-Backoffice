import type { ApiCategory } from '@/data-access/categories/categories.schemas'

export function collectDescendantIds(
  rootId: string,
  categories: readonly ApiCategory[],
): Set<string> {
  const descendants = new Set<string>()
  const stack: string[] = [rootId]
  while (stack.length > 0) {
    const currentId = stack.pop()
    if (currentId === undefined) break
    for (const category of categories) {
      if (category.parentId !== currentId) continue
      if (descendants.has(category.id)) continue
      descendants.add(category.id)
      stack.push(category.id)
    }
  }
  return descendants
}

export function countDescendants(
  rootId: string,
  categories: readonly ApiCategory[],
): number {
  return collectDescendantIds(rootId, categories).size
}

export function buildParentPathLabel(
  category: ApiCategory,
  categories: readonly ApiCategory[],
): string {
  const byId = new Map(categories.map((candidate) => [candidate.id, candidate]))
  const segments: string[] = [category.name]
  let currentParentId = category.parentId
  while (currentParentId !== null) {
    const parent = byId.get(currentParentId)
    if (parent === undefined) break
    segments.unshift(parent.name)
    currentParentId = parent.parentId
  }
  return segments.join(' / ')
}
