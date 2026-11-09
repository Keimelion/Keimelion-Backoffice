'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteAdminUser } from '@/features/users/hooks/use-users'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import type { AdminUserDetailParsed } from '@keimelion/sdk/schemas'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUserDetailParsed
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: DeleteUserDialogProps): React.JSX.Element {
  const mutation = useDeleteAdminUser()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(user.id)
    notifySuccess({ title: translate('users.mutation.deleted_toast') })
    onOpenChange(false)
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="users.delete_dialog"
      values={{ email: user.email }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
