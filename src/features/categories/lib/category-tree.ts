import {
  CATEGORY_MAX_ALLOWED_DEPTH,
  type ApiCategory,
} from '@/data-access/categories/categories.schemas'
import { resolveCategoryName } from '@/features/categories/lib/resolve-category-name'
import type { Locale } from '@/lib/i18n/locale'

export interface CategoryNode {
  category: ApiCategory
  children: CategoryNode[]
}

export type DropInvalidReason = 'self' | 'cycle' | 'max_depth'

export interface DropDisabledArgs {
  nodeId: string
  newParentDepth: number
  activeDragId: string | null
  activeDescendantIds: ReadonlySet<string>
  activeSubtreeMaxDepth: number
  activeOriginalDepth: number
}

export function computeDropDisabledReason(args: DropDisabledArgs): DropInvalidReason | null {
  if (args.activeDragId === null) return null
  if (args.nodeId === args.activeDragId) return 'self'
  if (args.activeDescendantIds.has(args.nodeId)) return 'cycle'
  const newChildDepth = args.newParentDepth + 1
  const offset = newChildDepth - args.activeOriginalDepth
  if (args.activeSubtreeMaxDepth + offset > CATEGORY_MAX_ALLOWED_DEPTH) return 'max_depth'
  return null
}

interface DropDecisionInvalid {
  kind: 'invalid'
  reason: DropInvalidReason
}
interface DropDecisionValid {
  kind: 'valid'
}
export type DropDecision = DropDecisionValid | DropDecisionInvalid

export interface EvaluateDropArgs {
  dragged: CategoryNode
  newParentId: string | null
  nodeById: ReadonlyMap<string, CategoryNode>
  categories: readonly ApiCategory[]
}

export function evaluateDrop({
  dragged,
  newParentId,
  nodeById,
  categories,
}: EvaluateDropArgs): DropDecision {
  if (newParentId === dragged.category.id) return { kind: 'invalid', reason: 'self' }
  if (newParentId !== null) {
    const descendants = collectDescendantIds(dragged.category.id, categories)
    if (descendants.has(newParentId)) return { kind: 'invalid', reason: 'cycle' }
  }
  const newParentDepth = newParentId === null ? -1 : (nodeById.get(newParentId)?.category.depth ?? -1)
  const newChildDepth = newParentDepth + 1
  const offset = newChildDepth - dragged.category.depth
  const subtreeMaxDepth = getSubtreeMaxDepth(dragged)
  if (subtreeMaxDepth + offset > CATEGORY_MAX_ALLOWED_DEPTH) {
    return { kind: 'invalid', reason: 'max_depth' }
  }
  return { kind: 'valid' }
}

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

export function collectAncestorIds(
  categoryId: string,
  categories: readonly ApiCategory[],
): Set<string> {
  const byId = new Map(categories.map((candidate) => [candidate.id, candidate]))
  const ancestors = new Set<string>()
  const self = byId.get(categoryId)
  if (self === undefined) return ancestors
  let currentParentId = self.parentId
  while (currentParentId !== null) {
    const parent = byId.get(currentParentId)
    if (parent === undefined) break
    ancestors.add(parent.id)
    currentParentId = parent.parentId
  }
  return ancestors
}

export function buildParentPathLabel(
  category: ApiCategory,
  categories: readonly ApiCategory[],
  locale: Locale,
): string {
  const byId = new Map(categories.map((candidate) => [candidate.id, candidate]))
  const segments: string[] = [resolveCategoryName(category, locale)]
  let currentParentId = category.parentId
  while (currentParentId !== null) {
    const parent = byId.get(currentParentId)
    if (parent === undefined) break
    segments.unshift(resolveCategoryName(parent, locale))
    currentParentId = parent.parentId
  }
  return segments.join(' / ')
}

export function buildCategoryForest(
  categories: readonly ApiCategory[],
  locale: Locale,
): CategoryNode[] {
  const nodeById = new Map<string, CategoryNode>()
  for (const category of categories) {
    nodeById.set(category.id, { category, children: [] })
  }
  const roots: CategoryNode[] = []
  for (const category of categories) {
    const node = nodeById.get(category.id)
    if (node === undefined) continue
    if (category.parentId === null) {
      roots.push(node)
      continue
    }
    const parentNode = nodeById.get(category.parentId)
    if (parentNode === undefined) {
      roots.push(node)
      continue
    }
    parentNode.children.push(node)
  }
  sortForestAlphabetically(roots, locale)
  return roots
}

function sortForestAlphabetically(nodes: CategoryNode[], locale: Locale): void {
  nodes.sort((a, b) =>
    resolveCategoryName(a.category, locale).localeCompare(resolveCategoryName(b.category, locale)),
  )
  for (const node of nodes) {
    sortForestAlphabetically(node.children, locale)
  }
}

export function getSubtreeMaxDepth(node: CategoryNode): number {
  if (node.children.length === 0) return node.category.depth
  return node.children.reduce(
    (max, child) => Math.max(max, getSubtreeMaxDepth(child)),
    node.category.depth,
  )
}
