'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import { RoleBadge } from '@/features/users/components/role-badge'

const ROLE_PARAM = 'role'
const PAGINATION_PARAM = 'page'

export function RoleFilter(): React.JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeRole = searchParams.get(ROLE_PARAM)

  const handleToggle = (role: UserRole): void => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(ROLE_PARAM)
    if (activeRole !== role) params.set(ROLE_PARAM, role)
    params.delete(PAGINATION_PARAM)
    router.replace(`?${params.toString()}`, { scroll: false })
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
