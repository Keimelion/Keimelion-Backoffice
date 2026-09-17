'use client'

import { Suspense } from 'react'
import { getStoredUser, isAdmin } from '@/data-access/_shared/auth-storage'
import { OccasionTypesAdminContent } from '@/features/occasion-types/components/occasion-types-admin-content'
import { OccasionTypesList } from '@/features/occasion-types/components/occasion-types-list'

export function OccasionTypesPageContent(): React.JSX.Element {
  const user = getStoredUser()

  if (user !== null && isAdmin(user.role)) {
    return (
      <Suspense>
        <OccasionTypesAdminContent />
      </Suspense>
    )
  }

  return (
    <Suspense>
      <OccasionTypesList />
    </Suspense>
  )
}
