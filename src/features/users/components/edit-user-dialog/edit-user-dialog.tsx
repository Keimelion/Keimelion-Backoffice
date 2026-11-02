'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import { UserForm } from '@/features/users/components/user-form'
import type { UserFormEditValues } from '@/features/users/components/user-form'
import { useUpdateAdminUser } from '@/features/users/hooks/use-users'
import type { AdminApiUser } from '@/data-access/users/admin-users.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminApiUser
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateAdminUser()

  function handleSubmit(
    values: UserFormEditValues,
    setError: UseFormSetError<UserFormEditValues>,
  ): void {
    mutation.mutate(
      { id: user.id, input: values },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('users.mutation.updated_toast') })
          onOpenChange(false)
        },
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
