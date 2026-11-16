'use client'

import { Send } from 'lucide-react'
import { ApiError } from '@keimelion/sdk/client'
import { ErrorCode } from '@keimelion/sdk/enums'
import type { AdminUserDetailParsed } from '@keimelion/sdk/schemas'
import { Button } from '@/components/ui/button'
import { useResendStaffInvitation } from '@/features/users/hooks/use-users'
import { translate } from '@/lib/i18n/translate'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifyError, notifySuccess } from '@/lib/notify'

interface ResendInvitationButtonProps {
  user: AdminUserDetailParsed
}

const STAFF_INVITATION_ERROR_CODES: readonly string[] = [
  ErrorCode.STAFF_INVITATION_NOT_PENDING,
  ErrorCode.STAFF_INVITATION_NOT_STAFF_ACCOUNT,
]

export function ResendInvitationButton({ user }: ResendInvitationButtonProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useResendStaffInvitation()

  function handleClick(): void {
    mutation.mutate(user.id, {
      onSuccess: (updatedUser) => {
        notifySuccess({
          title: translate('users.mutation.invitation_resent_toast', { email: updatedUser.email }),
        })
      },
      onError: notifyResendError,
    })
  }

  return (
    <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={handleClick}>
      <Send className="mr-2 h-4 w-4" />
      {mutation.isPending
        ? t('users.actions.resend_invitation_pending')
        : t('users.actions.resend_invitation')}
    </Button>
  )
}

function notifyResendError(error: Error): void {
  if (error instanceof ApiError && STAFF_INVITATION_ERROR_CODES.includes(error.code)) {
    notifyError({ title: error.message })
    return
  }
  notifyError(error)
}
