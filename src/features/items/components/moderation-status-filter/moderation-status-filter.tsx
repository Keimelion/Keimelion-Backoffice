'use client'

import { MODERATION_STATUS_VALUES } from '@keimelion/api/shared/enums/moderation-status'
import type { ModerationStatus } from '@keimelion/api/shared/enums/moderation-status'
import { useUrlParams } from '@/components/shared/use-url-params'
import { ModerationStatusBadge } from '@/features/items/components/moderation-status-badge'

export const MODERATION_STATUS_PARAM = 'moderationStatus'

export function ModerationStatusFilter(): React.JSX.Element {
  const { searchParams, setFilterParam } = useUrlParams()
  const activeStatus = searchParams.get(MODERATION_STATUS_PARAM)

  const handleToggle = (status: ModerationStatus): void => {
    setFilterParam(MODERATION_STATUS_PARAM, activeStatus === status ? null : status)
  }

  return (
    <div className="flex items-center gap-1.5">
      {MODERATION_STATUS_VALUES.map((status) => {
        const isActive = activeStatus === status
        return (
          <button
            key={status}
            type="button"
            aria-pressed={isActive}
            onClick={() => { handleToggle(status) }}
            className="cursor-pointer rounded-full transition-opacity hover:opacity-80 aria-[pressed=false]:opacity-40"
          >
            <ModerationStatusBadge status={status} />
          </button>
        )
      })}
    </div>
  )
}
