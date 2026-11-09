'use client'

import { useMemo } from 'react'
import { ApiError } from '@keimelion/sdk/client'
import { HttpStatus } from '@keimelion/sdk/enums'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { DataTable, DataTablePagination } from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
import { useExpandedRowIds } from '@/components/shared/use-expanded-row-ids'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { UserRefCell } from '@/components/shared/user-ref-cell'
import { ReportDetailsRow } from '@/features/reports/components/report-details-row'
import { ReportStatusActions } from '@/features/reports/components/report-status-actions'
import { ReportStatusBadge } from '@/features/reports/components/report-status-badge'
import { ReportsFilters } from '@/features/reports/components/reports-filters'
import { ForbiddenState } from '@/components/shared/forbidden-state'
import { useAdminReports } from '@/features/reports/hooks/use-admin-reports'
import { listReportsQuerySchema } from '@/features/reports/reports.input-schemas'
import { resolveReportTargetLabel } from '@/features/reports/resolve-report-target-label'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'

export function ReportsList(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listReportsQuerySchema)
  const reportsQuery = useAdminReports(filters)
  const items = reportsQuery.data?.items ?? []
  const { expandedIds, toggleExpanded } = useExpandedRowIds(items)

  const columns = useMemo(() => buildColumns(t), [t])

  if (reportsQuery.error instanceof ApiError && reportsQuery.error.status === HttpStatus.FORBIDDEN) {
    return <ForbiddenState namespace="reports.forbidden" />
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={reportsQuery.isLoading}
      error={reportsQuery.error}
      emptyLabel={t('reports.table.empty')}
      skeletonRowCount={filters.limit}
      onRetry={() => { void reportsQuery.refetch() }}
      getRowLabel={resolveReportTargetLabel}
      renderExpandedRow={(report) => <ReportDetailsRow report={report} />}
      isRowExpanded={(report) => expandedIds.has(report.id)}
      onRowClick={(report) => { toggleExpanded(report.id) }}
      toolbar={<ReportsFilters />}
      footer={
        <DataTablePagination
          page={filters.page}
          pageSize={filters.limit}
          total={reportsQuery.data?.pagination.total ?? 0}
        />
      }
    />
  )
}

function buildColumns(t: TranslateFn): DataTableColumn<AdminReportDetailParsed>[] {
  return [
    {
      key: 'target',
      header: t('reports.table.column.target'),
      cell: (report) => (
        <div className="flex max-w-xs flex-col gap-0.5">
          <span className="truncate font-medium">{resolveReportTargetLabel(report)}</span>
          <span className="text-xs text-muted-foreground">
            {t(`reports.target_type.${report.targetType}`)}
          </span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: t('reports.table.column.reason'),
      cell: (report) => t(`reports.reason.${report.reason}`),
    },
    {
      key: 'reporter',
      header: t('reports.table.column.reporter'),
      cell: (report) => (
        <UserRefCell
          user={report.reporter === null ? null : { ...report.reporter, email: null }}
          fallback={t('reports.deleted_account')}
        />
      ),
    },
    {
      key: 'status',
      header: t('reports.table.column.status'),
      sortable: true,
      className: 'w-36',
      cell: (report) => <ReportStatusBadge status={report.status} />,
    },
    {
      key: 'createdAt',
      header: t('reports.table.column.created_at'),
      sortable: true,
      className: 'w-28',
      cell: (report) => formatDate(report.createdAt),
    },
    {
      key: 'actions',
      header: t('reports.table.column.actions'),
      className: 'w-24 text-right',
      cell: (report) => <ReportStatusActions report={report} />,
    },
  ]
}
