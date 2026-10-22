'use client'

import type { FeedbackStatus } from '@keimelion/api/shared/enums/feedback-status'
import { FEEDBACK_STATUS_VALUES } from '@keimelion/api/shared/enums/feedback-status'
import { useUrlParams } from '@/components/shared/use-url-params'
import { FeedbackStatusBadge } from '@/features/feedback/components/feedback-status-badge'
import { useTranslate } from '@/lib/i18n/use-translate'

export const STATUS_PARAM = 'status'

export function FeedbackStatusFilter(): React.JSX.Element {
  const t = useTranslate()
  const { searchParams, setFilterParam } = useUrlParams()
  const activeStatus = searchParams.get(STATUS_PARAM)
  const hasActiveStatus = activeStatus !== null

  const handleToggle = (status: FeedbackStatus): void => {
    setFilterParam(STATUS_PARAM, activeStatus === status ? null : status)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {t('feedback.filters.status_label')}
      </span>
      <div className="flex h-9 items-center gap-1.5">
        {FEEDBACK_STATUS_VALUES.map((status) => {
          const isActive = activeStatus === status
          const isDimmed = hasActiveStatus && !isActive
          return (
            <button
              key={status}
              type="button"
              aria-pressed={isActive}
              onClick={() => { handleToggle(status) }}
              className={`cursor-pointer rounded-full transition-opacity hover:opacity-80 ${isDimmed ? 'opacity-40' : ''}`}
            >
              <FeedbackStatusBadge status={status} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
