'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteAdminUser } from '@/features/users/hooks/use-users'
import type { AdminApiUser } from '@/data-access/users/admin-users.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminApiUser
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
