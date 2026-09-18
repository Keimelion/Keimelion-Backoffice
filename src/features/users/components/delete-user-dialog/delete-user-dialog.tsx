'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import type { AdminApiUser } from '@/data-access/users/list-users'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useDeleteUser } from '@/features/users/hooks/use-delete-user'

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
  const mutation = useDeleteUser()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(user.id, {
      onSuccess: () => {
        notifySuccess({ title: translate('users.mutation.deleted_toast') })
        onOpenChange(false)
      },
    })
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="users.delete_dialog"
      values={{
        email: user.email,
        username: user.username ?? user.email,
      }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
