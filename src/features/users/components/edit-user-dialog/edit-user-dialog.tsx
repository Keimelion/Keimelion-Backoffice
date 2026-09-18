'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormDialog } from '@/components/shared/form-dialog'
import { UserForm } from '@/features/users/components/user-form'
import type { UserFormEditValues } from '@/features/users/components/user-form'
import { ADMIN_USERS_QUERY_KEY, updateAdminUser } from '@/data-access/users/admin-users.api'
import type { AdminUserMutationUser } from '@/data-access/users/admin-users.schemas'
import type { AdminApiUser } from '@/data-access/users/list-users'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminApiUser
}

interface UpdateUserVariables {
  id: string
  input: UserFormEditValues
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps): React.JSX.Element {
  const t = useTranslate()
  const queryClient = useQueryClient()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)

  const mutation = useMutation<AdminUserMutationUser, Error, UpdateUserVariables>({
    mutationFn: ({ id, input }) => updateAdminUser(id, input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      notifySuccess({ title: translate('users.mutation.updated_toast') })
      onOpenChange(false)
    },
  })

  function handleSubmit(
    values: UserFormEditValues,
    setError: UseFormSetError<UserFormEditValues>,
  ): void {
    mutation.mutate(
      { id: user.id, input: values },
      {
        onError: (error) => {
          setError('root', { message: error.message })
        },
      },
    )
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('users.edit.dialog_title')}
      isFormDirty={isFormDirty}
    >
      <UserForm
        mode="edit"
        user={user}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
