'use client'

import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export interface DataTableColumn<TRow> {
  key: string
  header: string
  cell: (row: TRow) => ReactNode
  className?: string
  sortable?: boolean
  sortField?: string
}

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[]
  data: TRow[]
  isLoading: boolean
  error: Error | null
  emptyLabel: string
  skeletonRowCount: number
  onRetry: () => void
  getRowClassName?: (row: TRow) => string | undefined
  toolbar?: ReactNode
  footer?: ReactNode
}

const SKELETON_OPACITY_STEP = 0.15

export function DataTable<TRow>({
  columns,
  data,
  isLoading,
  error,
  emptyLabel,
  skeletonRowCount,
  onRetry,
  getRowClassName,
  toolbar,
  footer,
}: DataTableProps<TRow>): React.JSX.Element {
  const t = useTranslate()
  const { active, cycleSort } = useSortParam()

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
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          {toolbar}
        </div>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((column) => {
              const sortField = column.sortField ?? column.key
              const direction = active?.field === sortField ? active.direction : null
              return (
                <TableHead key={column.key} className={column.className}>
                  {column.sortable === true ? (
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
          {isLoading ? renderSkeletonRows(columns, skeletonRowCount) : renderDataRows(columns, data, emptyLabel, getRowClassName)}
        </TableBody>
      </Table>
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

function renderSkeletonRows<TRow>(
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

function renderDataRows<TRow>(
  columns: DataTableColumn<TRow>[],
  data: TRow[],
  emptyLabel: string,
  getRowClassName?: (row: TRow) => string | undefined,
): ReactNode {
  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </TableCell>
      </TableRow>
    )
  }

  return data.map((row, rowIndex) => (
    <TableRow
      key={rowIndex}
      className={cn('hover:bg-primary/10', getRowClassName?.(row))}
    >
      {columns.map((column) => (
        <TableCell key={column.key} className={column.className}>
          {column.cell(row)}
        </TableCell>
      ))}
    </TableRow>
  ))
}
