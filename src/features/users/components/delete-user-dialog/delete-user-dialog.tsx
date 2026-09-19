'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { ADMIN_USERS_QUERY_KEY, deleteAdminUser } from '@/data-access/users/admin-users.api'
import type { AdminApiUser } from '@/data-access/users/list-users'
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
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      notifySuccess({ title: translate('users.mutation.deleted_toast') })
      onOpenChange(false)
    },
  })

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(user.id)
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
