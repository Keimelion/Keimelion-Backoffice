'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { OccasionTypeForm } from '@/features/occasion-types/components/occasion-type-form'
import type { OccasionTypeFormValues } from '@/features/occasion-types/components/occasion-type-form'
import { useCreateOccasionType } from '@/features/occasion-types/hooks/use-admin-occasion-types'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface CreateOccasionTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOccasionTypeDialog({
  open,
  onOpenChange,
}: CreateOccasionTypeDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateOccasionType()

  function handleSubmit(
    values: OccasionTypeFormValues,
    setError: UseFormSetError<OccasionTypeFormValues>,
  ): void {
    mutation.mutate(values, {
      onSuccess: () => {
        notifySuccess({ title: translate('occasion_types.mutation.created_toast') })
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
          setError('slug', { message: t('occasion_types.form.error.slug_conflict') })
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
      title={t('occasion_types.admin.create_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <OccasionTypeForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
