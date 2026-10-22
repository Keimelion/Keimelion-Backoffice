'use client'

import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import { useUrlParams } from '@/components/shared/use-url-params'
import { RoleBadge } from '@/features/users/components/role-badge'
import { useTranslate } from '@/lib/i18n/use-translate'

export const ROLE_PARAM = 'role'

export function RoleFilter(): React.JSX.Element {
  const t = useTranslate()
  const { searchParams, setFilterParam } = useUrlParams()
  const activeRole = searchParams.get(ROLE_PARAM)
  const hasActiveRole = activeRole !== null

  const handleToggle = (role: UserRole): void => {
    setFilterParam(ROLE_PARAM, activeRole === role ? null : role)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {t('users.filters.role_label')}
      </span>
      <div className="flex h-9 items-center gap-1.5">
        {USER_ROLE_VALUES.map((role) => {
          const isActive = activeRole === role
          const isDimmed = hasActiveRole && !isActive
          return (
            <button
              key={role}
              type="button"
              aria-pressed={isActive}
              onClick={() => { handleToggle(role) }}
              className={`cursor-pointer rounded-full transition-opacity hover:opacity-80 ${isDimmed ? 'opacity-40' : ''}`}
            >
              <RoleBadge role={role} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
