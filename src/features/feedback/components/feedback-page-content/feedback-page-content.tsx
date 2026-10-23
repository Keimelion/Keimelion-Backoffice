'use client'

import { isAdmin } from '@/data-access/_shared/auth-storage'
import { FeedbackForbidden } from '@/features/feedback/components/feedback-forbidden'
import { FeedbackList } from '@/features/feedback/components/feedback-list'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'

export function FeedbackPageContent(): React.JSX.Element {
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  if (!isCurrentUserAdmin) {
    return <FeedbackForbidden />
  }

  return <FeedbackList />
}
