'use client'

import { CircleCheck, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ReportStatuses, type REVIEWED_REPORT_STATUS_VALUES, type ReportStatus } from '@keimelion/sdk/enums'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { IconButton } from '@/components/shared/icon-button'
import { useUpdateReport } from '@/features/reports/hooks/use-update-report'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

type ReviewedReportStatus = (typeof REVIEWED_REPORT_STATUS_VALUES)[number]

interface ReviewActionConfig {
  labelId: MessageId
  Icon: LucideIcon
  className: string
}

const REVIEW_ACTIONS: Record<ReviewedReportStatus, ReviewActionConfig> = {
  upheld: {
    labelId: 'reports.actions.uphold',
    Icon: CircleCheck,
    className:
      'text-emerald-600/80 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400/90 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-400',
  },
  dismissed: {
    labelId: 'reports.actions.dismiss',
    Icon: XCircle,
    className:
      'text-rose-600/80 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400/90 dark:hover:bg-rose-400/10 dark:hover:text-rose-400',
  },
}

const AVAILABLE_REVIEWS: Record<ReportStatus, readonly ReviewedReportStatus[]> = {
  pending: [ReportStatuses.UPHELD, ReportStatuses.DISMISSED],
  upheld: [ReportStatuses.DISMISSED],
  dismissed: [ReportStatuses.UPHELD],
}

interface ReportStatusActionsProps {
  report: AdminReportDetailParsed
}

export function ReportStatusActions({ report }: ReportStatusActionsProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useUpdateReport()

  return (
    <div className="flex justify-end gap-1">
      {AVAILABLE_REVIEWS[report.status].map((nextStatus) => {
        const { labelId, Icon, className } = REVIEW_ACTIONS[nextStatus]
        return (
          <IconButton
            key={nextStatus}
            label={t(labelId)}
            disabled={mutation.isPending}
            onClick={() => { mutation.mutate({ id: report.id, input: { status: nextStatus } }) }}
            className={className}
          >
            <Icon />
          </IconButton>
        )
      })}
    </div>
  )
}
