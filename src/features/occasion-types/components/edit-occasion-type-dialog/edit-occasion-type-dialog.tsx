'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import { OccasionTypeForm } from '@/features/occasion-types/components/occasion-type-form'
import type { OccasionTypeFormValues } from '@/features/occasion-types/components/occasion-type-form'
import { useUpdateOccasionType } from '@/features/occasion-types/hooks/use-admin-occasion-types'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'

interface EditOccasionTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occasionTypeId: string
  initialValues: OccasionTypeFormValues
}

const EDITABLE_OCCASION_TYPE_FIELDS = ['emoji', 'sortOrder', 'isActive', 'translations'] as const satisfies readonly (keyof OccasionTypeFormValues)[]

export function EditOccasionTypeDialog({
  open,
  onOpenChange,
  occasionTypeId,
  initialValues,
}: EditOccasionTypeDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateOccasionType()

  function handleSubmit(
    values: OccasionTypeFormValues,
    setError: UseFormSetError<OccasionTypeFormValues>,
  ): void {
    mutation.mutate(
      { id: occasionTypeId, input: pickChangedFields(initialValues, values, EDITABLE_OCCASION_TYPE_FIELDS) },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('occasion_types.mutation.updated_toast') })
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
      title={t('occasion_types.admin.edit_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <OccasionTypeForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
