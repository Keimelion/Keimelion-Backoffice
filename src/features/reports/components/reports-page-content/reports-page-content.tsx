'use client'

import { isAdmin } from '@/data-access/_shared/auth-storage'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { ForbiddenState } from '@/components/shared/forbidden-state'
import { ReportsList } from '@/features/reports/components/reports-list'

export function ReportsPageContent(): React.JSX.Element {
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  if (!isCurrentUserAdmin) {
    return <ForbiddenState namespace="reports.forbidden" />
  }

  return <ReportsList />
}
