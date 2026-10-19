'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { LIST_STATUS_VALUES } from '@keimelion/api/shared/enums/list-status'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { Badge } from '@/components/ui/badge'
import { isAdmin } from '@/data-access/_shared/auth-storage'
import { listListsQuerySchema, type ApiAdminList } from '@/data-access/lists/lists.schemas'
import { useAdminLists, useRestoreList } from '@/features/lists/hooks/use-admin-lists'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'
import { DeleteListDialog } from '@/features/lists/components/delete-list-dialog'
import { EditListDialog } from '@/features/lists/components/edit-list-dialog'
import { ListItemsSubTable } from '@/features/lists/components/list-items-sub-table'
import { ListsForbidden } from '@/features/lists/components/lists-forbidden'
import { formatDate } from '@/lib/format-date'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'

const SEARCH_PARAM = 'search'
const LIST_STATUS_PARAM = 'listStatus'
const OCCASION_TYPE_PARAM = 'occasionTypeId'
const OWNER_PARAM = 'ownerUserId'
const SORT_PARAM = 'sort'
const CURRENCY_FALLBACK = 'EUR'
const PRICE_DECIMALS = 2

const CLEARABLE_PARAMS = [
  SEARCH_PARAM,
  LIST_STATUS_PARAM,
  OCCASION_TYPE_PARAM,
  OWNER_PARAM,
  SORT_PARAM,
]

function resolveRowClassName(list: ApiAdminList): string | undefined {
  if (list.deletedAt !== null) return 'opacity-50'
  return undefined
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

export function ListsPageContent(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listListsQuerySchema)
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  const occasionTypesQuery = useOccasionTypes()
  const occasionTypes = occasionTypesQuery.data ?? []
  const occasionTypeById = useMemo(
    () => new Map(occasionTypes.map((occasionType) => [occasionType.id, occasionType])),
    [occasionTypes],
  )

  const [editTarget, setEditTarget] = useState<ApiAdminList | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiAdminList | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const listsQuery = useAdminLists(isCurrentUserAdmin ? filters : {})
  const lists = isCurrentUserAdmin ? listsQuery.data?.items ?? [] : []
  const total = listsQuery.data?.pagination.total ?? 0

  const restoreMutation = useRestoreList()

  const visibleIds = useMemo(() => new Set(lists.map((list) => list.id)), [lists])

  useEffect(() => {
    setExpandedIds((previous) => {
      let changed = false
      const next = new Set<string>()
      for (const id of previous) {
        if (visibleIds.has(id)) {
          next.add(id)
          continue
        }
        changed = true
      }
      return changed ? next : previous
    })
  }, [visibleIds])

  function toggleExpanded(listId: string): void {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(listId)) {
        next.delete(listId)
        return next
      }
      next.add(listId)
      return next
    })
  }

  const handleRestore = useCallback((list: ApiAdminList): void => {
    restoreMutation.mutate(list.id, {
      onSuccess: () => {
        notifySuccess({ title: translate('lists.mutation.restored_toast', { title: list.title }) })
      },
    })
  }, [restoreMutation])

  const listsFilters: FilterDefinition[] = [
    {
      type: 'text',
      paramName: SEARCH_PARAM,
      label: t('lists.filters.search_label'),
      placeholder: t('lists.filters.search_placeholder'),
    },
    {
      type: 'select',
      paramName: LIST_STATUS_PARAM,
      label: t('lists.filters.list_status_label'),
      placeholder: t('lists.filters.all_option'),
      options: LIST_STATUS_VALUES.map((status) => ({
        value: status,
        label: t(`lists.status.${status}`),
      })),
    },
    {
      type: 'select',
      paramName: OCCASION_TYPE_PARAM,
      label: t('lists.filters.occasion_type_label'),
      placeholder: t('lists.filters.all_option'),
      options: occasionTypes.map((occasionType) => ({
        value: occasionType.id,
        label: occasionType.label,
      })),
    },
    {
      type: 'text',
      paramName: OWNER_PARAM,
      label: t('lists.filters.owner_label'),
      placeholder: t('lists.filters.owner_placeholder'),
    },
  ]

  const columns = useMemo<DataTableColumn<ApiAdminList>[]>(
    () => buildColumns({
      t,
      occasionTypeById,
      isCurrentUserAdmin,
      isRestorePending: restoreMutation.isPending,
      onEdit: setEditTarget,
      onDelete: setDeleteTarget,
      onRestore: handleRestore,
    }),
    [t, occasionTypeById, isCurrentUserAdmin, restoreMutation.isPending, handleRestore],
  )

  const renderExpandedRow = useMemo(
    () => (list: ApiAdminList) => <ListItemsSubTable listId={list.id} />,
    [],
  )

  const isRowExpanded = useMemo(
    () => (list: ApiAdminList) => expandedIds.has(list.id),
    [expandedIds],
  )

  if (!isCurrentUserAdmin) {
    return <ListsForbidden />
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={lists}
        isLoading={listsQuery.isLoading}
        error={listsQuery.error}
        emptyLabel={t('lists.table.empty')}
        skeletonRowCount={filters.limit}
        onRetry={() => { void listsQuery.refetch() }}
        getRowClassName={resolveRowClassName}
        getRowLabel={(list) => list.title}
        renderExpandedRow={renderExpandedRow}
        isRowExpanded={isRowExpanded}
        onRowClick={(list) => { toggleExpanded(list.id) }}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <DataTableFilters filters={listsFilters} />
            <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
          </div>
        }
        footer={
          <DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />
        }
      />

      {editTarget !== null ? (
        <EditListDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          list={editTarget}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteListDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          list={deleteTarget}
        />
      ) : null}
    </>
  )
}

interface BuildColumnsArgs {
  t: TranslateFn
  occasionTypeById: Map<string, { id: string; label: string }>
  isCurrentUserAdmin: boolean
  isRestorePending: boolean
  onEdit: (list: ApiAdminList) => void
  onDelete: (list: ApiAdminList) => void
  onRestore: (list: ApiAdminList) => void
}

function buildColumns({
  t,
  occasionTypeById,
  isCurrentUserAdmin,
  isRestorePending,
  onEdit,
  onDelete,
  onRestore,
}: BuildColumnsArgs): DataTableColumn<ApiAdminList>[] {
  const baseColumns: DataTableColumn<ApiAdminList>[] = [
    {
      key: 'title',
      header: t('lists.table.column.title'),
      sortable: true,
      cell: (list) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{list.title}</span>
          <span className="text-xs text-muted-foreground">{list.slug}</span>
        </div>
      ),
    },
    {
      key: 'owner',
      header: t('lists.table.column.owner'),
      cell: (list) => (
        <span className="text-sm text-muted-foreground">
          {list.owner === null
            ? t('lists.table.owner_none')
            : list.owner.username ?? list.owner.email}
        </span>
      ),
    },
    {
      key: 'occasionType',
      header: t('lists.table.column.occasion_type'),
      cell: (list) => {
        if (list.occasionTypeId === null) {
          return <span className="text-xs text-muted-foreground">—</span>
        }
        const occasionType = occasionTypeById.get(list.occasionTypeId) ?? null
        if (occasionType === null) {
          return <span className="text-xs text-muted-foreground">—</span>
        }
        return <span className="text-sm">{occasionType.label}</span>
      },
    },
    {
      key: 'tags',
      header: t('lists.table.column.tags'),
      cell: (list) => (
        <div className="flex flex-wrap gap-1">
          {list.tags.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            list.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'itemCount',
      header: t('lists.table.column.item_count'),
      className: 'w-20',
      cell: (list) => <Badge variant="secondary">{list.itemCount}</Badge>,
    },
    {
      key: 'totalEstimatedPrice',
      header: t('lists.table.column.total_estimated_price'),
      className: 'w-32',
      cell: (list) => {
        if (list.totalEstimatedPrice === null) {
          return <span className="text-xs text-muted-foreground">{t('lists.table.price_none')}</span>
        }
        const amount = Number(list.totalEstimatedPrice)
        if (!Number.isFinite(amount)) {
          return <span className="text-xs text-muted-foreground">{t('lists.table.price_none')}</span>
        }
        return <span className="text-sm">{formatCurrency(amount, CURRENCY_FALLBACK)}</span>
      },
    },
    {
      key: 'listStatus',
      header: t('lists.table.column.list_status'),
      className: 'w-28',
      cell: (list) => <Badge variant="outline">{t(`lists.status.${list.listStatus}`)}</Badge>,
    },
    {
      key: 'createdAt',
      header: t('lists.table.column.created_at'),
      sortable: true,
      cell: (list) => formatDate(list.createdAt),
    },
    {
      key: 'updatedAt',
      header: t('lists.table.column.updated_at'),
      sortable: true,
      cell: (list) => formatDate(list.updatedAt),
    },
  ]

  if (!isCurrentUserAdmin) return baseColumns

  const actionsColumn: DataTableColumn<ApiAdminList> = {
    key: 'actions',
    header: t('lists.table.column.actions'),
    className: 'w-32 text-right',
    cell: (list) => (
      <div className="flex justify-end gap-1">
        <IconButton
          label={t('common.actions.update', { name: list.title })}
          onClick={() => { onEdit(list) }}
        >
          <Pencil />
        </IconButton>
        {list.deletedAt === null ? (
          <IconButton
            label={t('common.actions.delete', { name: list.title })}
            tone="destructive"
            onClick={() => { onDelete(list) }}
          >
            <Trash2 />
          </IconButton>
        ) : (
          <IconButton
            label={t('lists.admin.restore.tooltip', { name: list.title })}
            disabled={isRestorePending}
            onClick={() => { onRestore(list) }}
          >
            <RotateCcw />
          </IconButton>
        )}
      </div>
    ),
  }

  return [...baseColumns, actionsColumn]
}
