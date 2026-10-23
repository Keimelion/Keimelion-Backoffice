'use client'

import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { BadgeToggleFilter } from '@/components/shared/badge-toggle-filter'
import { RoleBadge } from '@/features/users/components/role-badge'
import { useTranslate } from '@/lib/i18n/use-translate'

export const ROLE_PARAM = 'role'

export function RoleFilter(): React.JSX.Element {
  const t = useTranslate()
  return (
    <BadgeToggleFilter<UserRole>
      paramName={ROLE_PARAM}
      label={t('users.filters.role_label')}
      values={USER_ROLE_VALUES}
      renderBadge={(role) => <RoleBadge role={role} />}
    />
  )
}
