'use client'

import { useState } from 'react'
import { useIntl } from 'react-intl'
import { ITEM_STATUS_VALUES } from '@keimelion/api/shared/enums/item-status'
import type { ItemStatus } from '@keimelion/api/shared/enums/item-status'
import { Badge } from '@/components/ui/badge'
import { ItemStatusBadge } from '@/features/lists/components/item-status-badge'
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
import { ImageThumbnail } from '@/components/shared/image-thumbnail'
import { useAdminListItems } from '@/features/lists/hooks/use-admin-list-items'
import type { ApiAdminListItem } from '@/data-access/lists/lists.schemas'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'
import type { MessageId } from '@/lib/i18n/messages/en'

const DEFAULT_PAGE_SIZE = 20
const SKELETON_ROW_COUNT = 3
const SKELETON_OPACITY_STEP = 0.15
const PRICE_DECIMALS = 2

interface ColumnDefinition {
  headerId: MessageId
  className?: string
}

const COLUMNS: ColumnDefinition[] = [
  { headerId: 'lists.sub_table.column.image', className: 'w-14' },
  { headerId: 'lists.sub_table.column.name' },
  { headerId: 'lists.sub_table.column.quantity', className: 'w-20' },
  { headerId: 'lists.sub_table.column.average_price', className: 'w-28' },
  { headerId: 'lists.sub_table.column.item_status', className: 'w-28' },
  { headerId: 'lists.sub_table.column.categories', className: 'w-40' },
  { headerId: 'lists.sub_table.column.tags', className: 'w-40' },
  { headerId: 'lists.sub_table.column.created_at', className: 'w-28' },
]

const KNOWN_ITEM_STATUSES: ReadonlySet<string> = new Set(ITEM_STATUS_VALUES)

type FormatCurrencyFn = (amount: number, currency: string) => string

interface ListItemsSubTableProps {
  listId: string
}

export function ListItemsSubTable({ listId }: ListItemsSubTableProps): React.JSX.Element {
  const t = useTranslate()
  const intl = useIntl()
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

  const formatCurrency: FormatCurrencyFn = (amount, currency) =>
    intl.formatNumber(amount, {
      style: 'currency',
      currency,
      minimumFractionDigits: PRICE_DECIMALS,
      maximumFractionDigits: PRICE_DECIMALS,
    })

  return (
    <div className="rounded-md border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column.headerId} className={column.className}>
                {t(column.headerId)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading
            ? renderSkeletonRows()
            : renderDataRows(items, t, formatCurrency)}
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
      {COLUMNS.map((column) => (
        <TableCell key={column.headerId} className={column.className}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

function renderDataRows(
  items: ApiAdminListItem[],
  t: TranslateFn,
  formatCurrency: FormatCurrencyFn,
): React.ReactNode {
  if (items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={COLUMNS.length} className="py-6 text-center text-sm text-muted-foreground">
          {t('lists.sub_table.empty')}
        </TableCell>
      </TableRow>
    )
  }

  return items.map((listItem) => {
    const average = resolveAveragePrice(listItem)
    return (
      <TableRow key={listItem.id} className="hover:bg-transparent">
        <TableCell className="w-14">
          <ImageThumbnail src={listItem.item.imageUrl} alt={listItem.item.name} />
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
        <TableCell className="w-20 text-sm text-muted-foreground">
          {listItem.quantityDesired}
        </TableCell>
        <TableCell className="w-28 text-sm">
          {average === null ? (
            <span className="text-muted-foreground">{t('lists.sub_table.no_price')}</span>
          ) : (
            formatCurrency(average.amount, average.currency)
          )}
        </TableCell>
        <TableCell className="w-28">
          {renderItemStatus(listItem.itemStatus)}
        </TableCell>
        <TableCell className="w-40">
          {renderBadgeList(
            listItem.item.categories.map((category) => category.name),
            t,
          )}
        </TableCell>
        <TableCell className="w-40">
          {renderBadgeList(
            listItem.item.tags.map((tag) => tag.name),
            t,
          )}
        </TableCell>
        <TableCell className="w-28 text-sm text-muted-foreground">
          {formatDate(listItem.createdAt)}
        </TableCell>
      </TableRow>
    )
  })
}

function renderItemStatus(itemStatus: string): React.ReactNode {
  if (!KNOWN_ITEM_STATUSES.has(itemStatus)) {
    return <Badge variant="outline">{itemStatus}</Badge>
  }
  return <ItemStatusBadge status={itemStatus as ItemStatus} />
}

function renderBadgeList(names: string[], t: TranslateFn): React.ReactNode {
  if (names.length === 0) {
    return <span className="text-xs text-muted-foreground">{t('lists.sub_table.none')}</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {names.map((name) => (
        <Badge key={name} variant="secondary" className="text-xs">
          {name}
        </Badge>
      ))}
    </div>
  )
}

interface AveragePrice {
  amount: number
  currency: string
}

function resolveAveragePrice(listItem: ApiAdminListItem): AveragePrice | null {
  if (listItem.averagePrice === null) return null
  const amount = Number(listItem.averagePrice)
  if (!Number.isFinite(amount)) return null
  return { amount, currency: listItem.displayCurrency }
}
