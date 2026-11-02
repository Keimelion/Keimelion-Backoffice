'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { Info } from 'lucide-react'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { UserForm } from '@/features/users/components/user-form'
import type { UserFormCreateValues } from '@/features/users/components/user-form'
import { useCreateAdminUser } from '@/features/users/hooks/use-users'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateAdminUser()

  function handleSubmit(
    values: UserFormCreateValues,
    setError: UseFormSetError<UserFormCreateValues>,
  ): void {
    mutation.mutate(values, {
      onSuccess: () => {
        notifySuccess({ title: translate('users.mutation.created_toast', { email: values.email }) })
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
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
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/50 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100">
        <Info className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p>{t('users.form.invitation_note')}</p>
      </div>
      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
