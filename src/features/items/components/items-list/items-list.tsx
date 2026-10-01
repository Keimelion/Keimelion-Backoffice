'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { listItemsQuerySchema, type ApiAdminItem } from '@/data-access/items/items.schemas'
import { useAdminItems } from '@/features/items/hooks/use-admin-items'
import { CreateItemDialog } from '@/features/items/components/create-item-dialog'
import { EditItemDialog } from '@/features/items/components/edit-item-dialog'
import { DeleteItemDialog } from '@/features/items/components/delete-item-dialog'
import { ItemThumbnail } from '@/features/items/components/item-thumbnail'
import { ManageItemSourcesSheet } from '@/features/items/components/manage-item-sources-sheet'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'

const SEARCH_PARAM = 'search'
const SORT_PARAM = 'sort'

const CLEARABLE_PARAMS = [SEARCH_PARAM, SORT_PARAM]

export function ItemsList(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listItemsQuerySchema)

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<ApiAdminItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiAdminItem | null>(null)
  const [sourcesTarget, setSourcesTarget] = useState<ApiAdminItem | null>(null)

  const itemsQuery = useAdminItems(filters)
  const items = itemsQuery.data?.items ?? []
  const total = itemsQuery.data?.pagination.total ?? 0

  const itemsFilters: FilterDefinition[] = [
    {
      type: 'text',
      paramName: SEARCH_PARAM,
      label: t('items.filters.search_label'),
      placeholder: t('items.filters.search_placeholder'),
    },
  ]

  const columns: DataTableColumn<ApiAdminItem>[] = [
    {
      key: 'image',
      header: t('items.table.column.image'),
      className: 'w-14',
      cell: (item) => <ItemThumbnail imageUrl={item.imageUrl} alt={item.name} />,
    },
    {
      key: 'name',
      header: t('items.table.column.name'),
      sortable: true,
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{item.name}</span>
          {item.description !== null ? (
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {item.description}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'sources',
      header: t('items.table.column.sources'),
      className: 'w-28',
      cell: (item) => (
        <button
          type="button"
          onClick={() => { setSourcesTarget(item) }}
          className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
          aria-label={t('items.sources.sheet.title', { name: item.name })}
        >
          <Badge variant="secondary">{item.sources.length}</Badge>
        </button>
      ),
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
    {
      key: 'actions',
      header: t('items.table.column.actions'),
      className: 'w-28 text-right',
      cell: (item) => (
        <div className="flex justify-end gap-1">
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
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        isLoading={itemsQuery.isLoading}
        error={itemsQuery.error}
        emptyLabel={t('items.table.empty')}
        skeletonRowCount={filters.limit}
        onRetry={() => { void itemsQuery.refetch() }}
        getRowLabel={(item) => item.name}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <DataTableFilters filters={itemsFilters} />
            <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
            <div className="ml-auto">
              <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('items.admin.create_button')}
              </Button>
            </div>
          </div>
        }
        footer={
          <DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />
        }
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
          item={deleteTarget}
        />
      ) : null}

      {sourcesTarget !== null ? (
        <ManageItemSourcesSheet
          open
          onOpenChange={(open) => {
            if (!open) setSourcesTarget(null)
          }}
          item={sourcesTarget}
        />
      ) : null}
    </>
  )
}
