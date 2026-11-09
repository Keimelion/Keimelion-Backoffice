'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { ErrorCode } from '@keimelion/sdk/enums'
import { HttpStatus } from '@keimelion/sdk/enums'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemForm } from '@/features/items/components/item-form'
import type { ItemFormCreateValues } from '@/features/items/components/item-form'
import { useCreateItem } from '@/features/items/hooks/use-admin-items'
import { applyApiValidationIssues } from '@/lib/apply-api-validation-issues'
import { resolveImageUploadErrorMessageId } from '@/lib/resolve-image-upload-error'
import { collapseTagsIssuePaths } from '@/lib/collapse-tags-issue-paths'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'
import { ApiError } from '@keimelion/sdk/client'

const CREATE_ITEM_ISSUE_PATHS = [
  'name',
  'description',
  'categories',
  'tags',
] as const

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateItemDialog({
  open,
  onOpenChange,
}: CreateItemDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateItem()

  function handleSubmit(
    values: ItemFormCreateValues,
    setError: UseFormSetError<ItemFormCreateValues>,
  ): void {
    const { image, ...input } = values
    mutation.mutate({ input, image }, {
      onSuccess: () => {
        notifySuccess({ title: translate('items.mutation.created_toast', { name: values.name }) })
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === HttpStatus.CONFLICT) {
          setError('name', { message: t('items.form.error.conflict') })
          return
        }
        if (
          error instanceof ApiError
          && error.code === ErrorCode.CATEGORY_NOT_FOUND
        ) {
          setError('categories', { message: t('items.form.error.category_not_found') })
          return
        }
        if (
          error instanceof ApiError
          && error.code === ErrorCode.TAG_INVALID_NAME
        ) {
          setError('tags', { message: t('items.form.error.tag_invalid_name') })
          return
        }
        const imageErrorMessageId = resolveImageUploadErrorMessageId(error)
        if (imageErrorMessageId !== null) {
          setError('image', { message: t(imageErrorMessageId) })
          return
        }
        if (
          error instanceof ApiError
          && error.code === ErrorCode.UNPROCESSABLE_ENTITY
        ) {
          const appliedCount = applyApiValidationIssues(
            collapseTagsIssuePaths(error.issues),
            setError as (path: string, errorValue: { message: string }) => void,
            CREATE_ITEM_ISSUE_PATHS,
          )
          if (appliedCount > 0) return
        }
        setError('root', { message: error.message })
      },
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('items.admin.create_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ItemForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
