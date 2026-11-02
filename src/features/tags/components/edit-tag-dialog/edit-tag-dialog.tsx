'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import type { ApiTag } from '@/data-access/tags/tags.schemas'
import { TagForm } from '@/features/tags/components/tag-form'
import type { TagFormValues } from '@/features/tags/components/tag-form'
import { useUpdateTag } from '@/features/tags/hooks/use-admin-tags'
import { translate } from '@/lib/i18n/translate'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifySuccess } from '@/lib/notify'

interface EditTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: ApiTag
}

export function EditTagDialog({
  open,
  onOpenChange,
  tag,
}: EditTagDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateTag()

  function handleSubmit(
    values: TagFormValues,
    setError: UseFormSetError<TagFormValues>,
  ): void {
    const trimmedName = values.name.trim()
    const trimmedSlug = values.slug.trim()
    const patch: { name?: string; slug?: string } = {}
    if (trimmedName !== tag.name) patch.name = trimmedName
    if (trimmedSlug !== tag.slug) patch.slug = trimmedSlug
    if (Object.keys(patch).length === 0) {
      onOpenChange(false)
      return
    }
    mutation.mutate(
      { id: tag.id, input: patch },
      {
        onSuccess: (updated) => {
          notifySuccess({
            title: translate('tags.mutation.updated_toast', { name: updated.name }),
          })
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
            setError('slug', { message: t('tags.form.error.slug_conflict') })
            return
          }
          setError('root', { message: error.message })
        },
      },
    )
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('tags.admin.edit_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <TagForm
        mode="edit"
        tag={tag}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
