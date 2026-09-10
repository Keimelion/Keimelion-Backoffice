'use client'

import type { ReactNode } from 'react'
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
import { cn } from '@/lib/utils'

export interface DataTableColumn<TRow> {
  key: string
  header: string
  cell: (row: TRow) => ReactNode
  className?: string
}

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[]
  data: TRow[]
  isLoading: boolean
  error: Error | null
  emptyLabel: string
  pageSize: number
  onRetry: () => void
  getRowClassName?: (row: TRow) => string | undefined
}

const SKELETON_OPACITY_STEP = 0.15

export function DataTable<TRow>({
  columns,
  data,
  isLoading,
  error,
  emptyLabel,
  pageSize,
  onRetry,
  getRowClassName,
}: DataTableProps<TRow>): React.JSX.Element {
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
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? renderSkeletonRows(columns, pageSize) : renderDataRows(columns, data, emptyLabel, getRowClassName)}
        </TableBody>
      </Table>
    </div>
  )
}

function renderSkeletonRows<TRow>(
  columns: DataTableColumn<TRow>[],
  pageSize: number,
): ReactNode {
  return Array.from({ length: pageSize }, (_, rowIndex) => (
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
      className={cn(getRowClassName?.(row))}
    >
      {columns.map((column) => (
        <TableCell key={column.key} className={column.className}>
          {column.cell(row)}
        </TableCell>
      ))}
    </TableRow>
  ))
}
