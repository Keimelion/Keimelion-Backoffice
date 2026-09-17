'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, DataTablePagination } from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import type { AdminOccasionType } from '@/data-access/occasion-types/admin-occasion-types.schemas'
import { CreateOccasionTypeDialog } from '@/features/occasion-types/components/create-occasion-type-dialog'
import { EditOccasionTypeDialog } from '@/features/occasion-types/components/edit-occasion-type-dialog'
import { DeleteOccasionTypeDialog } from '@/features/occasion-types/components/delete-occasion-type-dialog'
import type { EditFormValues } from '@/features/occasion-types/components/occasion-type-form'
import { useAdminOccasionTypes } from '@/features/occasion-types/hooks/use-admin-occasion-types'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'

const DEFAULT_LIMIT = 20

const adminOccasionTypesQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().catch(DEFAULT_LIMIT),
})

function resolveEnLabel(item: AdminOccasionType): string {
  const enTranslation = item.translations.find((tr) => tr.locale === 'en')
  return enTranslation?.label ?? item.slug
}

function resolveFrLabel(item: AdminOccasionType): string | null {
  const frTranslation = item.translations.find((tr) => tr.locale === 'fr')
  return frTranslation?.label ?? null
}

function buildEditFormValues(item: AdminOccasionType): EditFormValues {
  return {
    slug: item.slug,
    emoji: item.emoji,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    labelEn: resolveEnLabel(item),
    labelFr: resolveFrLabel(item),
  }
}

function resolveRowClassName(item: AdminOccasionType): string | undefined {
  if (!item.isActive) return 'opacity-50'
  return undefined
}

export function OccasionTypesAdminContent(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(adminOccasionTypesQuerySchema)
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<AdminOccasionType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminOccasionType | null>(null)

  const query = useAdminOccasionTypes({ page: filters.page, limit: filters.limit })
  const data = query.data?.items ?? []
  const total = query.data?.pagination.total ?? 0

  const columns: DataTableColumn<AdminOccasionType>[] = [
    {
      key: 'emoji',
      header: t('occasion_types.admin.column.emoji'),
      className: 'w-16',
      cell: (item) => <span className="text-xl">{item.emoji ?? '—'}</span>,
    },
    {
      key: 'slug',
      header: t('occasion_types.admin.column.slug'),
      cell: (item) => (
        <span className="font-mono text-sm text-muted-foreground">{item.slug}</span>
      ),
    },
    {
      key: 'label',
      header: t('occasion_types.admin.column.label'),
      cell: (item) => <span className="font-medium">{resolveEnLabel(item)}</span>,
    },
    {
      key: 'sortOrder',
      header: t('occasion_types.admin.column.sort_order'),
      className: 'w-24',
      cell: (item) => <span className="text-sm">{item.sortOrder}</span>,
    },
    {
      key: 'isActive',
      header: t('occasion_types.admin.column.is_active'),
      className: 'w-24',
      cell: (item) =>
        item.isActive ? (
          <Badge variant="default">{t('occasion_types.admin.badge.active')}</Badge>
        ) : (
          <Badge variant="secondary">{t('occasion_types.admin.badge.inactive')}</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: t('occasion_types.admin.column.created_at'),
      cell: (item) => formatDate(item.createdAt),
    },
    {
      key: 'actions',
      header: t('occasion_types.admin.column.actions'),
      className: 'w-28 text-right',
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <IconButton
            label={t('common.actions.update', { name: resolveEnLabel(item) })}
            onClick={() => { setEditTarget(item) }}
          >
            <Pencil />
          </IconButton>
          <IconButton
            label={t('common.actions.delete', { name: resolveEnLabel(item) })}
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
        data={data}
        isLoading={query.isLoading}
        error={query.error}
        emptyLabel={t('occasion_types.admin.empty_state.title')}
        skeletonRowCount={filters.limit}
        onRetry={() => { void query.refetch() }}
        getRowClassName={resolveRowClassName}
        toolbar={
          <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('occasion_types.admin.create_button')}
            </Button>
          </div>
        }
        footer={
          <DataTablePagination
            page={filters.page}
            pageSize={filters.limit}
            total={total}
          />
        }
      />

      <CreateOccasionTypeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editTarget !== null ? (
        <EditOccasionTypeDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          occasionTypeId={editTarget.id}
          initialValues={buildEditFormValues(editTarget)}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteOccasionTypeDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          occasionTypeId={deleteTarget.id}
          label={resolveEnLabel(deleteTarget)}
        />
      ) : null}
    </>
  )
}
