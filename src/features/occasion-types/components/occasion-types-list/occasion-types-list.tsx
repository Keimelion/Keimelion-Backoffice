'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useIntl } from 'react-intl'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'
import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'

const SKELETON_ROW_COUNT = 5

export function OccasionTypesList(): React.JSX.Element {
  const intl = useIntl()
  const occasionTypesQuery = useOccasionTypes()
  const data = occasionTypesQuery.data ?? []

  const occasionTypesColumns: DataTableColumn<ApiOccasionType>[] = [
    {
      key: 'emoji',
      header: intl.formatMessage({ id: 'occasion_types.table.column.emoji' }),
      className: 'w-16',
      cell: (row) => <span className="text-xl">{row.emoji ?? '—'}</span>,
    },
    {
      key: 'label',
      header: intl.formatMessage({ id: 'occasion_types.table.column.label' }),
      cell: (row) => <span className="font-medium">{row.label}</span>,
    },
    {
      key: 'slug',
      header: intl.formatMessage({ id: 'occasion_types.table.column.slug' }),
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">{row.slug}</span>
      ),
    },
    {
      key: 'actions',
      header: intl.formatMessage({ id: 'occasion_types.table.column.actions' }),
      className: 'w-28 text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <IconButton label={intl.formatMessage({ id: 'common.actions.update' }, { name: row.label })}>
            <Pencil />
          </IconButton>
          <IconButton label={intl.formatMessage({ id: 'common.actions.delete' }, { name: row.label })} tone="destructive">
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
      emptyLabel={intl.formatMessage({ id: 'occasion_types.table.empty' })}
      skeletonRowCount={SKELETON_ROW_COUNT}
      onRetry={() => { void occasionTypesQuery.refetch() }}
    />
  )
}
