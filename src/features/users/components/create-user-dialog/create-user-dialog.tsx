'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import { UserForm } from '@/features/users/components/user-form'
import type { UserFormCreateValues } from '@/features/users/components/user-form'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'
import { useCreateUser } from '@/features/users/hooks/use-create-user'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CONFLICT_STATUS = 409

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)

  const mutation = useCreateUser()

  function handleSubmit(
    values: UserFormCreateValues,
    setError: UseFormSetError<UserFormCreateValues>,
  ): void {
    mutation.mutate(values, {
      onSuccess: () => {
        notifySuccess({
          title: translate('users.mutation.created_toast', { email: values.email }),
        })
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === CONFLICT_STATUS) {
          setError('root', { message: t('users.form.error.conflict') })
          return
        }
        setError('root', { message: error.message })
      },
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('users.create.dialog_title')}
      isFormDirty={isFormDirty}
    >
      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
