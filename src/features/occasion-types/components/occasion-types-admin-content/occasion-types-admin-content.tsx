'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTablePagination,
  ReorderBanner,
  ReorderButton,
  useReorderMode,
} from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { basePaginationShape } from '@/data-access/_shared/pagination'
import type { AdminOccasionType } from '@/data-access/occasion-types/admin-occasion-types.schemas'
import { CreateOccasionTypeDialog } from '@/features/occasion-types/components/create-occasion-type-dialog'
import { EditOccasionTypeDialog } from '@/features/occasion-types/components/edit-occasion-type-dialog'
import { DeleteOccasionTypeDialog } from '@/features/occasion-types/components/delete-occasion-type-dialog'
import type { OccasionTypeFormValues } from '@/features/occasion-types/components/occasion-type-form'
import {
  useAdminOccasionTypes,
  useReorderOccasionTypes,
} from '@/features/occasion-types/hooks/use-admin-occasion-types'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/locale'
import type { Locale } from '@/lib/i18n/locale'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'

const adminOccasionTypesQuerySchema = z.object({
  ...basePaginationShape,
})

function resolveLabel(item: AdminOccasionType, locale: Locale): string {
  const translation = item.translations.find((tr) => tr.locale === locale)
  return translation?.label ?? item.slug
}

function buildEditFormValues(item: AdminOccasionType): OccasionTypeFormValues {
  const translations = Object.fromEntries(
    LOCALES.map((locale) => {
      const translation = item.translations.find((tr) => tr.locale === locale)
      return [locale, translation?.label ?? '']
    }),
  ) as Record<Locale, string>

  return {
    slug: item.slug,
    emoji: item.emoji,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    translations,
  }
}

function resolveRowClassName(item: AdminOccasionType): string | undefined {
  if (!item.isActive) return 'opacity-50'
  return undefined
}

export function OccasionTypesAdminContent(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(adminOccasionTypesQuerySchema)
  const { isReorderMode, enterReorderMode, exitReorderMode } = useReorderMode()
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<AdminOccasionType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminOccasionType | null>(null)

  const query = useAdminOccasionTypes({ page: filters.page, limit: filters.limit })
  const data = query.data?.items ?? []
  const total = query.data?.pagination.total ?? 0
  const reorderMutation = useReorderOccasionTypes({ page: filters.page, limit: filters.limit })

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
      cell: (item) => <span className="font-medium">{resolveLabel(item, DEFAULT_LOCALE)}</span>,
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
    ...(isReorderMode
      ? []
      : [
          {
            key: 'actions',
            header: t('occasion_types.admin.column.actions'),
            className: 'w-28 text-right',
            cell: (item: AdminOccasionType) => (
              <div className="flex justify-end gap-1">
                <IconButton
                  label={t('common.actions.update', { name: resolveLabel(item, DEFAULT_LOCALE) })}
                  onClick={() => { setEditTarget(item) }}
                >
                  <Pencil />
                </IconButton>
                <IconButton
                  label={t('common.actions.delete', { name: resolveLabel(item, DEFAULT_LOCALE) })}
                  tone="destructive"
                  onClick={() => { setDeleteTarget(item) }}
                >
                  <Trash2 />
                </IconButton>
              </div>
            ),
          } satisfies DataTableColumn<AdminOccasionType>,
        ]),
  ]

  const toolbar = isReorderMode ? (
    <ReorderBanner onExit={exitReorderMode} />
  ) : (
    <div className="flex items-center justify-end gap-2">
      <ReorderButton onClick={enterReorderMode} />
      <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
        <Plus className="mr-2 h-4 w-4" />
        {t('occasion_types.admin.create_button')}
      </Button>
    </div>
  )

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
        getRowLabel={(item) => resolveLabel(item, DEFAULT_LOCALE)}
        isReorderMode={isReorderMode}
        onReorder={(nextItems) => {
          reorderMutation.mutate({ previousItems: data, nextItems })
        }}
        toolbar={toolbar}
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
          label={resolveLabel(deleteTarget, DEFAULT_LOCALE)}
        />
      ) : null}
    </>
  )
}
