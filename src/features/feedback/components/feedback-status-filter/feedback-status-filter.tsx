'use client'

import type { FeedbackStatus } from '@keimelion/api/shared/enums/feedback-status'
import { FEEDBACK_STATUS_VALUES } from '@keimelion/api/shared/enums/feedback-status'
import { useUrlParams } from '@/components/shared/use-url-params'
import { FeedbackStatusBadge } from '@/features/feedback/components/feedback-status-badge'

export const STATUS_PARAM = 'status'

export function FeedbackStatusFilter(): React.JSX.Element {
  const { searchParams, setFilterParam } = useUrlParams()
  const activeStatus = searchParams.get(STATUS_PARAM)

  const handleToggle = (status: FeedbackStatus): void => {
    setFilterParam(STATUS_PARAM, activeStatus === status ? null : status)
  }

  return (
    <div className="flex items-center gap-1.5">
      {FEEDBACK_STATUS_VALUES.map((status) => {
        const isActive = activeStatus === status
        return (
          <button
            key={status}
            type="button"
            aria-pressed={isActive}
            onClick={() => { handleToggle(status) }}
            className="cursor-pointer rounded-full transition-opacity hover:opacity-80 aria-[pressed=false]:opacity-40"
          >
            <FeedbackStatusBadge status={status} />
          </button>
        )
      })}
    </div>
  )
}
