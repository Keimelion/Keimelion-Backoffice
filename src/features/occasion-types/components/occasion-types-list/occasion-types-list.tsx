'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'
import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'
import { useTranslate } from '@/lib/i18n/use-translate'

const SKELETON_ROW_COUNT = 5

export function OccasionTypesList(): React.JSX.Element {
  const t = useTranslate()
  const occasionTypesQuery = useOccasionTypes()
  const data = occasionTypesQuery.data ?? []

  const occasionTypesColumns: DataTableColumn<ApiOccasionType>[] = [
    {
      key: 'emoji',
      header: t('occasion_types.table.column.emoji'),
      className: 'w-16',
      cell: (row) => <span className="text-xl">{row.emoji ?? '—'}</span>,
    },
    {
      key: 'label',
      header: t('occasion_types.table.column.label'),
      cell: (row) => <span className="font-medium">{row.label}</span>,
    },
    {
      key: 'slug',
      header: t('occasion_types.table.column.slug'),
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">{row.slug}</span>
      ),
    },
    {
      key: 'actions',
      header: t('occasion_types.table.column.actions'),
      className: 'w-28 text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <IconButton label={t('common.actions.update', { name: row.label })}>
            <Pencil />
          </IconButton>
          <IconButton
            label={t('common.actions.delete', { name: row.label })}
            tone="destructive"
          >
            <Trash2 />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={occasionTypesColumns}
      data={data}
      isLoading={occasionTypesQuery.isLoading}
      error={occasionTypesQuery.error}
      emptyLabel={t('occasion_types.table.empty')}
      skeletonRowCount={SKELETON_ROW_COUNT}
      onRetry={() => {
        void occasionTypesQuery.refetch()
      }}
    />
  )
}
