'use client'

import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import { useUrlParams } from '@/components/shared/use-url-params'
import { RoleBadge } from '@/features/users/components/role-badge'

export const ROLE_PARAM = 'role'

export function RoleFilter(): React.JSX.Element {
  const { searchParams, setFilterParam } = useUrlParams()
  const activeRole = searchParams.get(ROLE_PARAM)

  const handleToggle = (role: UserRole): void => {
    setFilterParam(ROLE_PARAM, activeRole === role ? null : role)
  }

  return (
    <div className="flex items-center gap-1.5">
      {USER_ROLE_VALUES.map((role) => {
        const isActive = activeRole === role
        return (
          <button
            key={role}
            type="button"
            aria-pressed={isActive}
            onClick={() => { handleToggle(role) }}
            className="cursor-pointer rounded-full transition-opacity hover:opacity-80 aria-[pressed=false]:opacity-40"
          >
            <RoleBadge role={role} />
          </button>
        )
      })}
    </div>
  )
}
