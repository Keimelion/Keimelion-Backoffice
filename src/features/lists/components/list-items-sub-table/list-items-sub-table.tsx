'use client'

import { useState } from 'react'
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
import { ItemThumbnail } from '@/features/items/components/item-thumbnail'
import { useAdminListItems } from '@/features/lists/hooks/use-admin-list-items'
import type { ApiAdminListItem } from '@/data-access/lists/lists.schemas'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'

const DEFAULT_PAGE_SIZE = 20
const SKELETON_ROW_COUNT = 3
const SKELETON_OPACITY_STEP = 0.15
const SKELETON_COLUMN_COUNT = 5
const CURRENCY_FALLBACK = 'EUR'
const PRICE_DECIMALS = 2

interface ListItemsSubTableProps {
  listId: string
}

export function ListItemsSubTable({ listId }: ListItemsSubTableProps): React.JSX.Element {
  const t = useTranslate()
  const [page, setPage] = useState<number>(1)
  const query = useAdminListItems(listId, { page, limit: DEFAULT_PAGE_SIZE })

  if (query.isError) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3">
        <p className="text-sm font-medium text-destructive">{query.error.message}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => { void query.refetch() }}
        >
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  const items = query.data?.items ?? []
  const total = query.data?.pagination.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="rounded-md border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">{t('lists.sub_table.column.image')}</TableHead>
            <TableHead>{t('lists.sub_table.column.name')}</TableHead>
            <TableHead className="w-24">{t('lists.sub_table.column.quantity')}</TableHead>
            <TableHead className="w-32">{t('lists.sub_table.column.average_price')}</TableHead>
            <TableHead className="w-32">{t('lists.sub_table.column.created_at')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading
            ? renderSkeletonRows()
            : renderDataRows(items, t)}
        </TableBody>
      </Table>
      {total > DEFAULT_PAGE_SIZE ? (
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>{t('common.pagination.page_of', { page, totalPages })}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFirstPage}
              onClick={() => { setPage((previous) => Math.max(1, previous - 1)) }}
            >
              {t('common.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastPage}
              onClick={() => { setPage((previous) => previous + 1) }}
            >
              {t('common.pagination.next')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function renderSkeletonRows(): React.ReactNode {
  return Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
    <TableRow key={rowIndex} style={{ opacity: 1 - rowIndex * SKELETON_OPACITY_STEP }}>
      {Array.from({ length: SKELETON_COLUMN_COUNT }, (__, columnIndex) => (
        <TableCell key={columnIndex}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

function renderDataRows(items: ApiAdminListItem[], t: TranslateFn): React.ReactNode {
  if (items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={SKELETON_COLUMN_COUNT} className="py-6 text-center text-sm text-muted-foreground">
          {t('lists.sub_table.empty')}
        </TableCell>
      </TableRow>
    )
  }

  return items.map((listItem) => {
    const average = computeAveragePrice(listItem)
    return (
      <TableRow key={listItem.id} className="hover:bg-transparent">
        <TableCell className="w-14">
          <ItemThumbnail imageUrl={listItem.item.imageUrl} alt={listItem.item.name} />
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{listItem.item.name}</span>
            {listItem.item.description !== null ? (
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {listItem.item.description}
              </span>
            ) : null}
          </div>
        </TableCell>
        <TableCell className="w-24 text-sm text-muted-foreground">
          {listItem.quantityDesired}
        </TableCell>
        <TableCell className="w-32 text-sm">
          {average === null ? (
            <span className="text-muted-foreground">{t('lists.sub_table.no_price')}</span>
          ) : (
            formatCurrency(average.amount, average.currency)
          )}
        </TableCell>
        <TableCell className="w-32 text-sm text-muted-foreground">
          {formatDate(listItem.createdAt)}
        </TableCell>
      </TableRow>
    )
  })
}

interface AveragePrice {
  amount: number
  currency: string
}

function computeAveragePrice(listItem: ApiAdminListItem): AveragePrice | null {
  let sum = 0
  let count = 0
  let currency: string | null = null
  for (const source of listItem.sources) {
    if (source.price === null) continue
    const amount = Number(source.price)
    if (!Number.isFinite(amount)) continue
    sum += amount
    count += 1
    currency ??= source.currency
  }
  if (count === 0) return null
  return { amount: sum / count, currency: currency ?? CURRENCY_FALLBACK }
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: PRICE_DECIMALS,
      maximumFractionDigits: PRICE_DECIMALS,
    }).format(amount)
  } catch {
    return `${amount.toFixed(PRICE_DECIMALS)} ${currency}`
  }
}
