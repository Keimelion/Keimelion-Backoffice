'use client'

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ASC, useSortParam, type SortDirection } from '@/components/shared/use-sort-param'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

export interface DataTableColumn<TRow> {
  key: string
  header: string
  cell: (row: TRow) => ReactNode
  className?: string
  sortable?: boolean
  sortField?: string
}

interface DataTableBaseRow {
  id: string
}

interface DataTableProps<TRow extends DataTableBaseRow> {
  columns: DataTableColumn<TRow>[]
  data: TRow[]
  isLoading: boolean
  error: Error | null
  emptyLabel: string
  skeletonRowCount: number
  onRetry: () => void
  getRowClassName?: (row: TRow) => string | undefined
  getRowLabel?: (row: TRow) => string
  isReorderMode?: boolean
  onReorder?: (nextItems: TRow[]) => void
  renderExpandedRow?: (row: TRow) => ReactNode
  isRowExpanded?: (row: TRow) => boolean
  toolbar?: ReactNode
  footer?: ReactNode
}

const SKELETON_OPACITY_STEP = 0.15
const DRAG_HANDLE_KEY = '__drag__'

export function DataTable<TRow extends DataTableBaseRow>({
  columns,
  data,
  isLoading,
  error,
  emptyLabel,
  skeletonRowCount,
  onRetry,
  getRowClassName,
  getRowLabel,
  isReorderMode = false,
  onReorder,
  renderExpandedRow,
  isRowExpanded,
  toolbar,
  footer,
}: DataTableProps<TRow>): React.JSX.Element {
  const t = useTranslate()
  const { active, cycleSort } = useSortParam()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const isDraggable = isReorderMode && onReorder !== undefined

  const displayedColumns = useMemo<DataTableColumn<TRow>[]>(() => {
    if (!isDraggable) return columns
    const dragColumn: DataTableColumn<TRow> = {
      key: DRAG_HANDLE_KEY,
      header: '',
      className: 'w-8',
      cell: () => null,
    }
    return [dragColumn, ...columns]
  }, [columns, isDraggable])

  const sortableIds = useMemo(() => data.map((row) => row.id), [data])

  function handleDragEnd(event: DragEndEvent): void {
    if (onReorder === undefined || !isReorderMode) return
    const { active: activeId, over } = event
    if (over === null || activeId.id === over.id) return
    const oldIndex = data.findIndex((row) => row.id === activeId.id)
    const newIndex = data.findIndex((row) => row.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(data, oldIndex, newIndex))
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-6 py-4">
        <p className="text-sm font-medium text-destructive">
          {error.message}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {toolbar !== undefined ? (
        <div className={cn('border-b border-border px-4 py-3', isReorderMode ? 'bg-primary/5' : 'bg-muted/30')}>
          {toolbar}
        </div>
      ) : null}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {displayedColumns.map((column) => {
                const sortField = column.sortField ?? column.key
                const direction = active?.field === sortField ? active.direction : null
                return (
                  <TableHead key={column.key} className={column.className}>
                    {column.sortable === true && !isReorderMode ? (
                      <button
                        type="button"
                        onClick={() => { cycleSort(sortField) }}
                        aria-label={t('common.table.sort_by', { column: column.header })}
                        className="flex cursor-pointer items-center gap-1 text-xs font-medium uppercase tracking-wide"
                      >
                        {column.header}
                        {renderSortIcon(direction)}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeletonRows(displayedColumns, skeletonRowCount)
            ) : (
              renderDataRows({
                columns: displayedColumns,
                data,
                emptyLabel,
                getRowClassName,
                getRowLabel,
                isDraggable,
                renderExpandedRow,
                isRowExpanded,
                sortableIds,
                t,
              })
            )}
          </TableBody>
        </Table>
      </DndContext>
      {footer !== undefined ? (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

function renderSortIcon(direction: SortDirection | null): ReactNode {
  if (direction === null) return <ArrowUpDown className="h-3.5 w-3.5" />
  if (direction === ASC) return <ArrowUp className="h-3.5 w-3.5" />
  return <ArrowDown className="h-3.5 w-3.5" />
}

function renderSkeletonRows<TRow extends DataTableBaseRow>(
  columns: DataTableColumn<TRow>[],
  skeletonRowCount: number,
): ReactNode {
  return Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
    <TableRow key={rowIndex} style={{ opacity: 1 - rowIndex * SKELETON_OPACITY_STEP }}>
      {columns.map((column) => (
        <TableCell key={column.key} className={column.className}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

interface RenderDataRowsArgs<TRow extends DataTableBaseRow> {
  columns: DataTableColumn<TRow>[]
  data: TRow[]
  emptyLabel: string
  getRowClassName: ((row: TRow) => string | undefined) | undefined
  getRowLabel: ((row: TRow) => string) | undefined
  isDraggable: boolean
  renderExpandedRow: ((row: TRow) => ReactNode) | undefined
  isRowExpanded: ((row: TRow) => boolean) | undefined
  sortableIds: string[]
  t: TranslateFn
}

function renderDataRows<TRow extends DataTableBaseRow>({
  columns,
  data,
  emptyLabel,
  getRowClassName,
  getRowLabel,
  isDraggable,
  renderExpandedRow,
  isRowExpanded,
  sortableIds,
  t,
}: RenderDataRowsArgs<TRow>): ReactNode {
  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </TableCell>
      </TableRow>
    )
  }

  const rows = data.map((row) => {
    const expandedContent = renderExpandedRow?.(row) ?? null
    const isExpanded = expandedContent === null ? false : (isRowExpanded?.(row) ?? false)
    return (
      <DataTableRow
        key={row.id}
        row={row}
        columns={columns}
        className={getRowClassName?.(row)}
        label={getRowLabel?.(row) ?? row.id}
        isDraggable={isDraggable}
        expandedContent={expandedContent}
        isExpanded={isExpanded}
        t={t}
      />
    )
  })

  if (!isDraggable) return rows

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      {rows}
    </SortableContext>
  )
}

interface DataTableRowProps<TRow extends DataTableBaseRow> {
  row: TRow
  columns: DataTableColumn<TRow>[]
  className: string | undefined
  label: string
  isDraggable: boolean
  expandedContent: ReactNode | null
  isExpanded: boolean
  t: TranslateFn
}

function DataTableRow<TRow extends DataTableBaseRow>({
  row,
  columns,
  className,
  label,
  isDraggable,
  expandedContent,
  isExpanded,
  t,
}: DataTableRowProps<TRow>): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, disabled: !isDraggable })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <>
      <TableRow
        ref={setNodeRef}
        style={style}
        className={cn('hover:bg-primary/10', className)}
      >
        {columns.map((column) => {
          if (column.key === DRAG_HANDLE_KEY) {
            return (
              <TableCell key={DRAG_HANDLE_KEY} className={column.className}>
                {isDraggable ? (
                  <button
                    type="button"
                    aria-label={t('common.reorder.drag_handle_label', { name: label })}
                    className="flex h-8 w-6 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                ) : null}
              </TableCell>
            )
          }
          return (
            <TableCell key={column.key} className={column.className}>
              {column.cell(row)}
            </TableCell>
          )
        })}
      </TableRow>
      {expandedContent !== null ? (
        <TableRow
          data-state={isExpanded ? 'open' : 'closed'}
          className="hover:bg-transparent data-[state=closed]:border-b-0 data-[state=open]:bg-muted/20 data-[state=open]:hover:bg-muted/20"
        >
          <TableCell colSpan={columns.length} className="p-0">
            <div
              data-state={isExpanded ? 'open' : 'closed'}
              className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out data-[state=open]:grid-rows-[1fr]"
            >
              <div className="overflow-hidden">
                <div className="px-4 py-3">{expandedContent}</div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}
