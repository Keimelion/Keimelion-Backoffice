'use client'

import { useMemo } from 'react'
import { REPORT_REASON_VALUES, REPORT_TARGET_TYPE_VALUES } from '@keimelion/sdk/enums'
import { ClearFiltersButton, DataTableFilters } from '@/components/shared/data-table'
import type { FilterDefinition } from '@/components/shared/data-table'
import {
  CREATED_FROM_PARAM,
  CREATED_TO_PARAM,
  DateRangeFilter,
} from '@/components/shared/date-range-filter'
import {
  ReportsStatusFilter,
  STATUS_PARAM,
} from '@/features/reports/components/reports-status-filter'
import type { ListReportsQuery } from '@/features/reports/reports.input-schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

const TARGET_TYPE_PARAM = 'targetType'
const REASON_PARAM = 'reason'
const SORT_PARAM = 'sort'

const CLEARABLE_PARAMS = [
  STATUS_PARAM,
  TARGET_TYPE_PARAM,
  REASON_PARAM,
  CREATED_FROM_PARAM,
  CREATED_TO_PARAM,
  SORT_PARAM,
]

interface ReportsFiltersProps {
  status: ListReportsQuery['status']
}

export function ReportsFilters({ status }: ReportsFiltersProps): React.JSX.Element {
  const t = useTranslate()

  const selectFilters = useMemo<FilterDefinition[]>(
    () => [
      {
        type: 'select',
        paramName: TARGET_TYPE_PARAM,
        label: t('reports.filters.target_type_label'),
        placeholder: t('reports.filters.target_type_all'),
        options: REPORT_TARGET_TYPE_VALUES.map((targetType) => ({
          value: targetType,
          label: t(`reports.target_type.${targetType}`),
        })),
      },
      {
        type: 'select',
        paramName: REASON_PARAM,
        label: t('reports.filters.reason_label'),
        placeholder: t('reports.filters.reason_all'),
        options: REPORT_REASON_VALUES.map((reason) => ({
          value: reason,
          label: t(`reports.reason.${reason}`),
        })),
      },
    ],
    [t],
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      <ReportsStatusFilter value={status} />
      <DataTableFilters filters={selectFilters} />
      <DateRangeFilter
        fromLabel={t('reports.filters.created_from_label')}
        toLabel={t('reports.filters.created_to_label')}
      />
      <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
    </div>
  )
}
