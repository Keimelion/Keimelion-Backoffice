'use client'

import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
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
    key: 'id',
    header: 'ID',
    cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
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
