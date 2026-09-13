'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'
import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'

const EMPTY_LABEL = 'No occasion types found.'
const SKELETON_ROW_COUNT = 5

const OCCASION_TYPES_COLUMNS: DataTableColumn<ApiOccasionType>[] = [
  {
    key: 'emoji',
    header: 'Emoji',
    className: 'w-16',
    cell: (row) => <span className="text-xl">{row.emoji ?? '—'}</span>,
  },
  {
    key: 'label',
    header: 'Label',
    cell: (row) => <span className="font-medium">{row.label}</span>,
  },
  {
    key: 'slug',
    header: 'Slug',
    cell: (row) => (
      <span className="font-mono text-sm text-muted-foreground">{row.slug}</span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    className: 'w-28 text-right',
    cell: () => (
      <div className="flex justify-end gap-1">
        <IconButton label="Update occasion type">
          <Pencil />
        </IconButton>
        <IconButton label="Delete occasion type" tone="destructive">
          <Trash2 />
        </IconButton>
      </div>
    ),
  },
]

export function OccasionTypesList(): React.JSX.Element {
  const occasionTypesQuery = useOccasionTypes()
  const data = occasionTypesQuery.data ?? []

  return (
    <DataTable
      columns={OCCASION_TYPES_COLUMNS}
      data={data}
      isLoading={occasionTypesQuery.isLoading}
      error={occasionTypesQuery.error}
      emptyLabel={EMPTY_LABEL}
      skeletonRowCount={SKELETON_ROW_COUNT}
      onRetry={() => { void occasionTypesQuery.refetch() }}
    />
  )
}
