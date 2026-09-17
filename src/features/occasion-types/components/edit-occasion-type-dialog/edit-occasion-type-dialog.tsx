'use client'

import type { UseFormSetError } from 'react-hook-form'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OccasionTypeEditForm } from '@/features/occasion-types/components/occasion-type-form'
import type { EditFormValues } from '@/features/occasion-types/components/occasion-type-form'
import { updateOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
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
  initialValues: EditFormValues
}

export function EditOccasionTypeDialog({
  open,
  onOpenChange,
  occasionTypeId,
  initialValues,
}: EditOccasionTypeDialogProps): React.JSX.Element {
  const t = useTranslate()
  const queryClient = useQueryClient()

  const mutation = useMutation<AdminOccasionType, Error, UpdateVariables>({
    mutationFn: ({ id, input }) => updateOccasionType(id, input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['occasion-types'] })
      notifySuccess({ title: translate('occasion_types.mutation.updated_toast') })
      onOpenChange(false)
    },
  })

  function handleSubmit(
    values: UpdateOccasionTypeInput,
    setError: UseFormSetError<UpdateOccasionTypeInput>,
  ): void {
    mutation.mutate(
      { id: occasionTypeId, input: values },
      {
        onError: (error) => {
          setError('root', { message: error.message })
        },
      },
    )
  }

  function handleCancel(): void {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('occasion_types.admin.edit_dialog_title')}</DialogTitle>
        </DialogHeader>
        <OccasionTypeEditForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={mutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
