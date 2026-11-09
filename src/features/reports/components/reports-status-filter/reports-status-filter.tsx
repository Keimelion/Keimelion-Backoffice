'use client'

import { REPORT_STATUS_VALUES, ReportStatuses } from '@keimelion/sdk/enums'
import type { ReportStatus } from '@keimelion/sdk/enums'
import { BadgeToggleFilter } from '@/components/shared/badge-toggle-filter'
import { ReportStatusBadge } from '@/features/reports/components/report-status-badge'
import { ALL_REPORT_STATUSES } from '@/features/reports/reports.input-schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

export const STATUS_PARAM = 'status'

export function ReportsStatusFilter(): React.JSX.Element {
  const t = useTranslate()
  return (
    <BadgeToggleFilter<ReportStatus>
      paramName={STATUS_PARAM}
      label={t('reports.filters.status_label')}
      values={REPORT_STATUS_VALUES}
      defaultValue={ReportStatuses.PENDING}
      clearedValue={ALL_REPORT_STATUSES}
      renderBadge={(status) => <ReportStatusBadge status={status} />}
    />
  )
}
