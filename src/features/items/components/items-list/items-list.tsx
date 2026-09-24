'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { useUrlParams } from '@/components/shared/use-url-params'
import { listItemsQuerySchema } from '@/data-access/items/items.schemas'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import { useItems } from '@/features/items/hooks/use-items'
import { ItemThumbnail } from '@/features/items/components/item-thumbnail'
import { ModerationStatusBadge } from '@/features/items/components/moderation-status-badge'
import { ModerationStatusFilter, MODERATION_STATUS_PARAM } from '@/features/items/components/moderation-status-filter'
import { CreateItemDialog } from '@/features/items/components/create-item-dialog'
import { EditItemDialog } from '@/features/items/components/edit-item-dialog'
import { DeleteItemDialog } from '@/features/items/components/delete-item-dialog'
import { RestoreItemDialog } from '@/features/items/components/restore-item-dialog'

const INCLUDE_DELETED_PARAM = 'includeDeleted'
const NAME_PARAM = 'name'

function resolveRowClassName(item: ApiAdminItem): string | undefined {
  if (item.deletedAt !== null) return 'opacity-50'
  return undefined
}

export function ItemsList(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listItemsQuerySchema)
  const { setFilterParam } = useUrlParams()
  const showDeleted = filters.includeDeleted === true

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<ApiAdminItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiAdminItem | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<ApiAdminItem | null>(null)

  const itemsQuery = useItems({
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
    name: filters.name,
    moderationStatus: filters.moderationStatus,
    includeDeleted: filters.includeDeleted,
  })

  const data = itemsQuery.data?.items ?? []
  const total = itemsQuery.data?.pagination.total ?? 0

  const itemsFilters: FilterDefinition[] = [
    {
      type: 'text',
      paramName: NAME_PARAM,
      label: t('items.filters.name_label'),
      placeholder: t('items.filters.name_placeholder'),
    },
  ]

  const itemsColumns: DataTableColumn<ApiAdminItem>[] = [
    {
      key: 'image',
      header: t('items.table.column.image'),
      className: 'w-14',
      cell: (item) => <ItemThumbnail imageUrl={item.imageUrl} name={item.name} className="h-10 w-10" />,
    },
    {
      key: 'name',
      header: t('items.table.column.name'),
      sortable: true,
      cell: (item) => (
        <Link href={`/items/${item.id}`} className="font-medium text-primary hover:underline">
          {item.name}
        </Link>
      ),
    },
    {
      key: 'moderationStatus',
      header: t('items.table.column.moderation_status'),
      sortable: true,
      cell: (item) => <ModerationStatusBadge status={item.moderationStatus} />,
    },
    {
      key: 'createdAt',
      header: t('items.table.column.created_at'),
      sortable: true,
      cell: (item) => formatDate(item.createdAt),
    },
    {
      key: 'updatedAt',
      header: t('items.table.column.updated_at'),
      sortable: true,
      cell: (item) => formatDate(item.updatedAt),
    },
    ...(showDeleted
      ? [
          {
            key: 'deletedAt',
            header: t('items.table.column.deleted_at'),
            cell: (item: ApiAdminItem) => (item.deletedAt !== null ? formatDate(item.deletedAt) : '—'),
          } satisfies DataTableColumn<ApiAdminItem>,
        ]
      : []),
    {
      key: 'actions',
      header: t('items.table.column.actions'),
      className: 'w-28 text-right',
      cell: (item) => (
        <div className="flex justify-end gap-1">
          {item.deletedAt !== null ? (
            <IconButton
              label={t('items.actions.restore_tooltip', { name: item.name })}
              onClick={() => { setRestoreTarget(item) }}
            >
              <RotateCcw />
            </IconButton>
          ) : (
            <>
              <IconButton
                label={t('common.actions.update', { name: item.name })}
                onClick={() => { setEditTarget(item) }}
              >
                <Pencil />
              </IconButton>
              <IconButton
                label={t('common.actions.delete', { name: item.name })}
                tone="destructive"
                onClick={() => { setDeleteTarget(item) }}
              >
                <Trash2 />
              </IconButton>
            </>
          )}
        </div>
      ),
    },
  ]

  const itemsClearableParams = [...itemsFilters.map((filter) => filter.paramName), MODERATION_STATUS_PARAM]

  return (
    <>
      <DataTable
        columns={itemsColumns}
        data={data}
        isLoading={itemsQuery.isLoading}
        error={itemsQuery.error}
        emptyLabel={t('items.table.empty')}
        skeletonRowCount={filters.limit}
        onRetry={() => { void itemsQuery.refetch() }}
        getRowClassName={resolveRowClassName}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <DataTableFilters filters={itemsFilters} />
            <div className="h-6 w-px bg-border" />
            <ModerationStatusFilter />
            <ClearFiltersButton paramNames={itemsClearableParams} />
            <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={showDeleted}
                onCheckedChange={(checked) => {
                  setFilterParam(INCLUDE_DELETED_PARAM, checked ? 'true' : null)
                }}
              />
              {t('items.filters.show_deleted_label')}
            </label>
            <div className="ml-auto">
              <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('items.actions.create_button')}
              </Button>
            </div>
          </div>
        }
        footer={<DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />}
      />

      <CreateItemDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editTarget !== null ? (
        <EditItemDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          item={editTarget}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteItemDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          itemId={deleteTarget.id}
          itemName={deleteTarget.name}
        />
      ) : null}

      {restoreTarget !== null ? (
        <RestoreItemDialog
          open
          onOpenChange={(open) => {
            if (!open) setRestoreTarget(null)
          }}
          itemId={restoreTarget.id}
          itemName={restoreTarget.name}
        />
      ) : null}
    </>
  )
}
