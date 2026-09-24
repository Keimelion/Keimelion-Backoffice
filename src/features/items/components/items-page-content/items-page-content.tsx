'use client'

import { getStoredUser, isAdmin } from '@/data-access/_shared/auth-storage'
import { ItemsForbidden } from '@/features/items/components/items-forbidden'
import { ItemsList } from '@/features/items/components/items-list'

export function ItemsPageContent(): React.JSX.Element {
  const user = getStoredUser()

  if (user === null || !isAdmin(user.role)) {
    return <ItemsForbidden />
  }

  return <ItemsList />
}
