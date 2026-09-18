'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { OccasionTypeForm } from '@/features/occasion-types/components/occasion-type-form'
import type { OccasionTypeFormValues } from '@/features/occasion-types/components/occasion-type-form'
import { OCCASION_TYPES_QUERY_KEY, createOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import type { AdminOccasionType } from '@/data-access/occasion-types/admin-occasion-types.schemas'
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
  const queryClient = useQueryClient()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)

  const mutation = useMutation<AdminOccasionType, Error, OccasionTypeFormValues>({
    mutationFn: createOccasionType,
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OCCASION_TYPES_QUERY_KEY })
      notifySuccess({ title: translate('occasion_types.mutation.created_toast') })
      onOpenChange(false)
    },
  })

  function handleSubmit(
    values: OccasionTypeFormValues,
    setError: UseFormSetError<OccasionTypeFormValues>,
  ): void {
    mutation.mutate(values, {
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
