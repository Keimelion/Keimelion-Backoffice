'use client'

import { isAdmin } from '@/data-access/_shared/auth-storage'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { ForbiddenState } from '@/components/shared/forbidden-state'
import { ItemsList } from '@/features/items/components/items-list'

export function ItemsPageContent(): React.JSX.Element {
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  if (!isCurrentUserAdmin) {
    return <ForbiddenState namespace="items.forbidden" />
  }

  return <ItemsList />
}
