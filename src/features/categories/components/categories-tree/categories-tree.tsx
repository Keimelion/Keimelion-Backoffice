'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  ChevronDown,
  ChevronRight,
  CornerDownLeft,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { IconButton } from '@/components/shared/icon-button'
import {
  CATEGORY_MAX_ALLOWED_DEPTH,
  type ApiCategory,
} from '@/data-access/categories/categories.schemas'
import {
  buildCategoryForest,
  collectAncestorIds,
  collectDescendantIds,
  computeDropDisabledReason,
  evaluateDrop,
  getSubtreeMaxDepth,
  type CategoryNode,
  type DropInvalidReason,
} from '@/features/categories/lib/category-tree'
import { useUpdateCategory } from '@/features/categories/hooks/use-admin-categories'
import { MoveCategoryDialog } from '@/features/categories/components/move-category-dialog'
import { translate } from '@/lib/i18n/translate'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

const ROOT_DROP_ID = '__root__'
const DRAG_ACTIVATION_DISTANCE_PX = 4

interface CategoriesTreeProps {
  categories: readonly ApiCategory[]
  isLoading: boolean
  error: Error | null
  revealParentId: string | null
  onRevealed: () => void
  onRetry: () => void
  onCreate: () => void
  onAddChild: (parentId: string) => void
  onEditCategory: (category: ApiCategory) => void
  onDeleteCategory: (category: ApiCategory) => void
}

export function CategoriesTree({
  categories,
  isLoading,
  error,
  revealParentId,
  onRevealed,
  onRetry,
  onCreate,
  onAddChild,
  onEditCategory,
  onDeleteCategory,
}: CategoriesTreeProps): React.JSX.Element {
  const t = useTranslate()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX } }),
  )
  const updateMutation = useUpdateCategory()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [hasInitializedExpansion, setHasInitializedExpansion] = useState<boolean>(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)

  const forest = useMemo(() => buildCategoryForest(categories), [categories])
  const nodeById = useMemo(() => indexForest(forest), [forest])

  useEffect(() => {
    if (hasInitializedExpansion) return
    if (forest.length === 0) return
    setExpandedIds(collectBranchIds(forest))
    setHasInitializedExpansion(true)
  }, [forest, hasInitializedExpansion])

  useEffect(() => {
    if (revealParentId === null) return
    setExpandedIds((previous) => {
      const next = new Set(previous)
      next.add(revealParentId)
      for (const ancestorId of collectAncestorIds(revealParentId, categories)) {
        next.add(ancestorId)
      }
      return next
    })
    onRevealed()
  }, [revealParentId, categories, onRevealed])

  const trimmedQuery = searchQuery.trim().toLowerCase()
  const isSearching = trimmedQuery.length > 0

  const matchVisibleIds = useMemo(() => {
    if (!isSearching) return null
    return computeMatchVisibleIds(forest, trimmedQuery)
  }, [forest, trimmedQuery, isSearching])

  const effectiveExpandedIds = useMemo(() => {
    if (matchVisibleIds === null) return expandedIds
    const branchIds = new Set<string>()
    for (const id of matchVisibleIds) {
      const node = nodeById.get(id)
      if (node !== undefined && node.children.length > 0) branchIds.add(id)
    }
    return branchIds
  }, [matchVisibleIds, nodeById, expandedIds])

  function toggleExpanded(id: string): void {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeNode = activeDragId === null ? null : (nodeById.get(activeDragId) ?? null)
  const activeDescendantIds = useMemo(() => {
    if (activeNode === null) return new Set<string>()
    return collectDescendantIds(activeNode.category.id, categories)
  }, [activeNode, categories])
  const activeSubtreeMaxDepth = activeNode === null ? 0 : getSubtreeMaxDepth(activeNode)

  function handleDragStart(event: DragStartEvent): void {
    setActiveDragId(String(event.active.id))
  }

  function handleDragCancel(): void {
    setActiveDragId(null)
  }

  function handleDragEnd(event: DragEndEvent): void {
    const activeId = String(event.active.id)
    setActiveDragId(null)
    const overId = event.over === null ? null : String(event.over.id)
    if (overId === null) return

    const dragged = nodeById.get(activeId)
    if (dragged === undefined) return
    const newParentId = overId === ROOT_DROP_ID ? null : overId
    if (newParentId === dragged.category.parentId) return

    const dropDecision = evaluateDrop({
      dragged,
      newParentId,
      nodeById,
      categories,
    })
    if (dropDecision.kind === 'invalid') {
      notifyError({ title: dropDecisionMessage(dropDecision.reason, t) })
      return
    }

    const currentParentName =
      dragged.category.parentId === null
        ? null
        : (nodeById.get(dragged.category.parentId)?.category.name ?? null)
    const newParentName = newParentId === null ? null : (nodeById.get(newParentId)?.category.name ?? null)
    setPendingMove({
      category: dragged.category,
      newParentId,
      currentParentName,
      newParentName,
    })
  }

  async function confirmPendingMove(): Promise<void> {
    if (pendingMove === null) return
    try {
      await updateMutation.mutateAsync({
        id: pendingMove.category.id,
        input: { parentId: pendingMove.newParentId },
      })
    } catch (error) {
      notifyError({
        title: translate('categories.mutation.move_error_toast', {
          name: pendingMove.category.name,
        }),
      })
      throw error
    }
    notifySuccess({
      title: translate('categories.mutation.moved_toast', { name: pendingMove.category.name }),
    })
    if (pendingMove.newParentId !== null) {
      const newParentId = pendingMove.newParentId
      setExpandedIds((previous) => {
        const next = new Set(previous)
        next.add(newParentId)
        for (const ancestorId of collectAncestorIds(newParentId, categories)) {
          next.add(ancestorId)
        }
        return next
      })
    }
  }

  if (isLoading) return <TreeLoadingSkeleton />
  if (error !== null) return <TreeError onRetry={onRetry} />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder={t('categories.tree.search_placeholder')}
          aria-label={t('categories.tree.search_label')}
          value={searchQuery}
          onChange={(event) => { setSearchQuery(event.target.value) }}
          className="max-w-sm"
        />
        <Button size="sm" onClick={onCreate} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('categories.tree.create_button')}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        {forest.length === 0 || (matchVisibleIds !== null && matchVisibleIds.size === 0) ? (
          <EmptyState hasSearch={isSearching} />
        ) : (
          <ul className="flex flex-col" role="tree" aria-label={t('categories.tree.aria_label')}>
            {forest.map((node, index) => (
              <TreeNode
                key={node.category.id}
                node={node}
                depth={0}
                isLastChild={index === forest.length - 1}
                expandedIds={effectiveExpandedIds}
                onToggleExpand={toggleExpanded}
                matchVisibleIds={matchVisibleIds}
                activeDragId={activeDragId}
                activeDescendantIds={activeDescendantIds}
                activeSubtreeMaxDepth={activeSubtreeMaxDepth}
                activeOriginalDepth={activeNode?.category.depth ?? 0}
                onAddChild={onAddChild}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
                isMutating={updateMutation.isPending}
              />
            ))}
          </ul>
        )}

        <RootDropZone isActive={activeDragId !== null} />

        <DragOverlay dropAnimation={null}>
          {activeNode !== null ? <DragGhost category={activeNode.category} /> : null}
        </DragOverlay>
      </DndContext>

      {pendingMove !== null ? (
        <MoveCategoryDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingMove(null)
          }}
          category={pendingMove.category}
          currentParentName={pendingMove.currentParentName}
          newParentName={pendingMove.newParentName}
          onConfirm={confirmPendingMove}
        />
      ) : null}
    </div>
  )
}

interface PendingMove {
  category: ApiCategory
  newParentId: string | null
  currentParentName: string | null
  newParentName: string | null
}

function indexForest(forest: readonly CategoryNode[]): Map<string, CategoryNode> {
  const map = new Map<string, CategoryNode>()
  const stack: CategoryNode[] = [...forest]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node === undefined) continue
    map.set(node.category.id, node)
    for (const child of node.children) stack.push(child)
  }
  return map
}

function collectBranchIds(forest: readonly CategoryNode[]): Set<string> {
  const branchIds = new Set<string>()
  const stack: CategoryNode[] = [...forest]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node === undefined) continue
    if (node.children.length > 0) branchIds.add(node.category.id)
    for (const child of node.children) stack.push(child)
  }
  return branchIds
}

function computeMatchVisibleIds(
  forest: readonly CategoryNode[],
  normalizedQuery: string,
): Set<string> {
  const visibleIds = new Set<string>()

  function visit(node: CategoryNode, ancestors: string[]): boolean {
    const nameMatches = node.category.name.toLowerCase().includes(normalizedQuery)
    const slugMatches = node.category.slug.toLowerCase().includes(normalizedQuery)
    const selfMatches = nameMatches || slugMatches

    let anyDescendantMatches = false
    const nextAncestors = [...ancestors, node.category.id]
    for (const child of node.children) {
      if (visit(child, nextAncestors)) anyDescendantMatches = true
    }

    if (selfMatches || anyDescendantMatches) {
      visibleIds.add(node.category.id)
      for (const ancestorId of ancestors) visibleIds.add(ancestorId)
      return true
    }
    return false
  }

  for (const root of forest) visit(root, [])
  return visibleIds
}

interface TreeNodeProps {
  node: CategoryNode
  depth: number
  isLastChild: boolean
  expandedIds: ReadonlySet<string>
  onToggleExpand: (id: string) => void
  matchVisibleIds: ReadonlySet<string> | null
  activeDragId: string | null
  activeDescendantIds: ReadonlySet<string>
  activeSubtreeMaxDepth: number
  activeOriginalDepth: number
  onAddChild: (parentId: string) => void
  onEditCategory: (category: ApiCategory) => void
  onDeleteCategory: (category: ApiCategory) => void
  isMutating: boolean
}

function TreeNode({
  node,
  depth,
  isLastChild,
  expandedIds,
  onToggleExpand,
  matchVisibleIds,
  activeDragId,
  activeDescendantIds,
  activeSubtreeMaxDepth,
  activeOriginalDepth,
  onAddChild,
  onEditCategory,
  onDeleteCategory,
  isMutating,
}: TreeNodeProps): React.JSX.Element | null {
  const t = useTranslate()
  const { category } = node

  if (matchVisibleIds !== null && !matchVisibleIds.has(category.id)) return null

  const isExpanded = expandedIds.has(category.id)
  const hasChildren = node.children.length > 0
  const canAddChild = category.depth < CATEGORY_MAX_ALLOWED_DEPTH
  const isDraggedSelf = activeDragId === category.id

  const dropDisabledReason = computeDropDisabledReason({
    nodeId: category.id,
    newParentDepth: category.depth,
    activeDragId,
    activeDescendantIds,
    activeSubtreeMaxDepth,
    activeOriginalDepth,
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: category.id,
    disabled: dropDisabledReason !== null || activeDragId === null,
  })

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({ id: category.id })

  const showDropHighlight = isOver && dropDisabledReason === null

  return (
    <li
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={hasChildren ? isExpanded : undefined}
      className={cn(
        'relative pl-6',
        'before:absolute before:left-[11px] before:top-0 before:w-px before:bg-border',
        isLastChild ? 'before:h-[19px]' : 'before:h-full',
        'after:absolute after:left-[11px] after:top-[19px] after:h-px after:w-[13px] after:bg-border',
      )}
    >
      <div
        ref={setDroppableRef}
        className={cn(
          'rounded-md border border-transparent transition-colors',
          showDropHighlight && 'border-primary bg-primary/5',
        )}
      >
        <div
          ref={setDraggableRef}
          className={cn(
            'group flex items-center gap-1 rounded-md py-1 pr-2 pl-1',
            isDraggedSelf && 'opacity-40',
          )}
        >
          <button
            type="button"
            aria-label={t('categories.tree.drag_handle_label', { name: category.name })}
            className="cursor-grab touch-none rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {hasChildren ? (
            <button
              type="button"
              onClick={() => { onToggleExpand(category.id) }}
              aria-label={
                isExpanded
                  ? t('categories.tree.collapse_label', { name: category.name })
                  : t('categories.tree.expand_label', { name: category.name })
              }
              aria-expanded={isExpanded}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-6" aria-hidden="true" />
          )}

          <span className="flex-1 truncate text-sm font-medium">{category.name}</span>
          <span className="truncate font-mono text-xs text-muted-foreground">{category.slug}</span>

          <div className="ml-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {canAddChild ? (
              <IconButton
                label={t('categories.tree.add_child_label', { name: category.name })}
                onClick={() => { onAddChild(category.id) }}
                disabled={isMutating}
              >
                <Plus />
              </IconButton>
            ) : (
              <span className="h-8 w-8" aria-hidden="true" />
            )}
            <IconButton
              label={t('common.actions.update', { name: category.name })}
              onClick={() => { onEditCategory(category) }}
              disabled={isMutating}
            >
              <Pencil />
            </IconButton>
            <IconButton
              label={t('common.actions.delete', { name: category.name })}
              tone="destructive"
              onClick={() => { onDeleteCategory(category) }}
              disabled={isMutating}
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded ? (
        <ul className="flex flex-col" role="group">
          {node.children.map((child, index) => (
            <TreeNode
              key={child.category.id}
              node={child}
              depth={depth + 1}
              isLastChild={index === node.children.length - 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              matchVisibleIds={matchVisibleIds}
              activeDragId={activeDragId}
              activeDescendantIds={activeDescendantIds}
              activeSubtreeMaxDepth={activeSubtreeMaxDepth}
              activeOriginalDepth={activeOriginalDepth}
              onAddChild={onAddChild}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              isMutating={isMutating}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function DragGhost({ category }: { category: ApiCategory }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-background px-3 py-1.5 shadow-lg">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{category.name}</span>
      <span className="font-mono text-xs text-muted-foreground">{category.slug}</span>
    </div>
  )
}

function dropDecisionMessage(reason: DropInvalidReason, t: TranslateFn): string {
  if (reason === 'cycle') return t('categories.tree.drop_error.cycle')
  if (reason === 'max_depth') return t('categories.tree.drop_error.max_depth')
  return t('categories.tree.drop_error.self')
}

function RootDropZone({ isActive }: { isActive: boolean }): React.JSX.Element | null {
  const t = useTranslate()
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ID, disabled: !isActive })
  if (!isActive) return null
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-2 text-xs text-muted-foreground transition-colors',
        isOver && 'border-primary bg-primary/10 text-primary',
      )}
    >
      <CornerDownLeft className="h-3.5 w-3.5" />
      {t('categories.tree.drop_root_hint')}
    </div>
  )
}

function EmptyState({ hasSearch }: { hasSearch: boolean }): React.JSX.Element {
  const t = useTranslate()
  return (
    <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      {hasSearch ? t('categories.tree.empty_search') : t('categories.tree.empty')}
    </p>
  )
}

function TreeLoadingSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

function TreeError({ onRetry }: { onRetry: () => void }): React.JSX.Element {
  const t = useTranslate()
  return (
    <Alert variant="destructive">
      <AlertDescription className="flex items-center justify-between gap-3">
        <span>{t('categories.tree.load_error')}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <Loader2 className="mr-2 h-4 w-4" />
          {t('common.actions.retry')}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
