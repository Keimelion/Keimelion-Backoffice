'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { FormDialog } from '@/components/shared/form-dialog'
import { OccasionTypeForm } from '@/features/occasion-types/components/occasion-type-form'
import type { OccasionTypeFormValues } from '@/features/occasion-types/components/occasion-type-form'
import { OCCASION_TYPES_QUERY_KEY, updateOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import type { AdminOccasionType, UpdateOccasionTypeInput } from '@/data-access/occasion-types/admin-occasion-types.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface UpdateVariables {
  id: string
  input: UpdateOccasionTypeInput
}

interface EditOccasionTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occasionTypeId: string
  initialValues: OccasionTypeFormValues
}

function toUpdateInput(values: OccasionTypeFormValues): UpdateOccasionTypeInput {
  return {
    emoji: values.emoji,
    sortOrder: values.sortOrder,
    isActive: values.isActive,
    labelEn: values.labelEn,
    labelFr: values.labelFr,
  }
}

export function EditOccasionTypeDialog({
  open,
  onOpenChange,
  occasionTypeId,
  initialValues,
}: EditOccasionTypeDialogProps): React.JSX.Element {
  const t = useTranslate()
  const queryClient = useQueryClient()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)

  const mutation = useMutation<AdminOccasionType, Error, UpdateVariables>({
    mutationFn: ({ id, input }) => updateOccasionType(id, input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OCCASION_TYPES_QUERY_KEY })
      notifySuccess({ title: translate('occasion_types.mutation.updated_toast') })
      onOpenChange(false)
    },
  })

  function handleSubmit(
    values: OccasionTypeFormValues,
    setError: UseFormSetError<OccasionTypeFormValues>,
  ): void {
    mutation.mutate(
      { id: occasionTypeId, input: toUpdateInput(values) },
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
