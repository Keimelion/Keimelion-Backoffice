'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { isAdmin } from '@/data-access/_shared/auth-storage'
import { listTagsQuerySchema, type ApiTag } from '@/data-access/tags/tags.schemas'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { useAdminTags } from '@/features/tags/hooks/use-admin-tags'
import { CreateTagDialog } from '@/features/tags/components/create-tag-dialog'
import { DeleteTagDialog } from '@/features/tags/components/delete-tag-dialog'
import { EditTagDialog } from '@/features/tags/components/edit-tag-dialog'
import { TagsForbidden } from '@/features/tags/components/tags-forbidden'
import { useTranslate } from '@/lib/i18n/use-translate'

const SEARCH_PARAM = 'search'
const PAGE_PARAM = 'page'

const CLEARABLE_PARAMS = [SEARCH_PARAM, PAGE_PARAM]

export function TagsPageContent(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listTagsQuerySchema)
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<ApiTag | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiTag | null>(null)

  const tagsQuery = useAdminTags(filters)
  const tags = tagsQuery.data?.items ?? []
  const total = tagsQuery.data?.pagination.total ?? 0

  if (!isCurrentUserAdmin) {
    return <TagsForbidden />
  }

  const tagsFilters: FilterDefinition[] = [
    {
      type: 'text',
      paramName: SEARCH_PARAM,
      label: t('tags.filters.search_label'),
      placeholder: t('tags.filters.search_placeholder'),
    },
  ]

  const columns: DataTableColumn<ApiTag>[] = [
    {
      key: 'name',
      header: t('tags.table.column.name'),
      cell: (tag) => <span className="font-medium">{tag.name}</span>,
    },
    {
      key: 'slug',
      header: t('tags.table.column.slug'),
      cell: (tag) => (
        <span className="font-mono text-sm text-muted-foreground">{tag.slug}</span>
      ),
    },
    {
      key: 'actions',
      header: t('tags.table.column.actions'),
      className: 'w-28 text-right',
      cell: (tag) => (
        <div className="flex justify-end gap-1">
          <IconButton
            label={t('common.actions.update', { name: tag.name })}
            onClick={() => { setEditTarget(tag) }}
          >
            <Pencil />
          </IconButton>
          <IconButton
            label={t('common.actions.delete', { name: tag.name })}
            tone="destructive"
            onClick={() => { setDeleteTarget(tag) }}
          >
            <Trash2 />
          </IconButton>
        </div>
      ),
    },
  ]

  const toolbar = (
    <div className="flex flex-wrap items-end gap-3">
      <DataTableFilters filters={tagsFilters} />
      <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('tags.admin.create_button')}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={tags}
        isLoading={tagsQuery.isLoading}
        error={tagsQuery.error}
        emptyLabel={t('tags.table.empty')}
        skeletonRowCount={filters.limit}
        onRetry={() => { void tagsQuery.refetch() }}
        getRowLabel={(tag) => tag.name}
        toolbar={toolbar}
        footer={
          <DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />
        }
      />

      <CreateTagDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editTarget !== null ? (
        <EditTagDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          tag={editTarget}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteTagDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          tag={deleteTarget}
        />
      ) : null}
    </>
  )
}
