'use client'

import { isAdmin } from '@/data-access/_shared/auth-storage'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { ReportsForbidden } from '@/features/reports/components/reports-forbidden'
import { ReportsList } from '@/features/reports/components/reports-list'

export function ReportsPageContent(): React.JSX.Element {
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  if (!isCurrentUserAdmin) {
    return <ReportsForbidden />
  }

  return <ReportsList />
}
