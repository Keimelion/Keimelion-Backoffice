'use client'

import { isAdmin } from '@/data-access/_shared/auth-storage'
import { ForbiddenState } from '@/components/shared/forbidden-state'
import { ReservationsList } from '@/features/reservations/components/reservations-list'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'

export function ReservationsPageContent(): React.JSX.Element {
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  if (!isCurrentUserAdmin) {
    return <ForbiddenState namespace="reservations.forbidden" />
  }

  return <ReservationsList />
}
