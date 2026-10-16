'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { TagForm } from '@/features/tags/components/tag-form'
import type { TagFormValues } from '@/features/tags/components/tag-form'
import { useCreateTag } from '@/features/tags/hooks/use-admin-tags'
import { translate } from '@/lib/i18n/translate'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifySuccess } from '@/lib/notify'

interface CreateTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTagDialog({
  open,
  onOpenChange,
}: CreateTagDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateTag()

  function handleSubmit(
    values: TagFormValues,
    setError: UseFormSetError<TagFormValues>,
  ): void {
    mutation.mutate(values, {
      onSuccess: (tag) => {
        notifySuccess({ title: translate('tags.mutation.created_toast', { name: tag.name }) })
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
          setError('slug', { message: t('tags.form.error.slug_conflict') })
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
      title={t('tags.admin.create_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <TagForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
