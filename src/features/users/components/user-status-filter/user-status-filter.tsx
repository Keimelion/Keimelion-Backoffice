'use client'

import { USER_STATUS_VALUES } from '@keimelion/sdk/enums'
import type { UserStatus } from '@keimelion/sdk/enums'
import { useUrlParams } from '@/components/shared/use-url-params'
import { UserStatusBadge } from '@/features/users/components/user-status-badge'
import { STATUS_PARAM_SEPARATOR } from '@/features/users/users.input-schemas'
import { useTranslate } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

export const STATUS_PARAM = 'status'

interface UserStatusFilterProps {
  selectedStatuses: readonly UserStatus[]
}

export function UserStatusFilter({ selectedStatuses }: UserStatusFilterProps): React.JSX.Element {
  const t = useTranslate()
  const { setFilterParam } = useUrlParams()
  const hasSelection = selectedStatuses.length > 0
  const label = t('users.filters.status_label')

  function handleToggle(status: UserStatus): void {
    const nextStatuses = toggleStatus(selectedStatuses, status)
    setFilterParam(STATUS_PARAM, nextStatuses.join(STATUS_PARAM_SEPARATOR))
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div role="group" aria-label={label} className="flex h-9 flex-wrap items-center gap-1.5">
        {USER_STATUS_VALUES.map((status) => {
          const isSelected = selectedStatuses.includes(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={isSelected}
              onClick={() => { handleToggle(status) }}
              className={cn(
                'cursor-pointer rounded-full transition-opacity hover:opacity-80',
                hasSelection && !isSelected && 'opacity-40',
              )}
            >
              <UserStatusBadge status={status} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function toggleStatus(
  selectedStatuses: readonly UserStatus[],
  toggledStatus: UserStatus,
): UserStatus[] {
  return USER_STATUS_VALUES.filter((status) =>
    status === toggledStatus ? !selectedStatuses.includes(status) : selectedStatuses.includes(status),
  )
}
