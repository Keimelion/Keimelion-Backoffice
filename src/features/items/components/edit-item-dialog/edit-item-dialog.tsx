'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { ErrorCode } from '@keimelion/sdk/enums'
import { HttpStatus } from '@keimelion/sdk/enums'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemForm } from '@/features/items/components/item-form'
import type { ItemFormEditValues } from '@/features/items/components/item-form'
import { ItemSourcesManager } from '@/features/items/components/item-sources-manager'
import { useUpdateItem } from '@/features/items/hooks/use-admin-items'
import { ItemReservationsSection } from '@/features/reservations/components/item-reservations-section'
import { applyApiValidationIssues } from '@/lib/apply-api-validation-issues'
import { resolveImageUploadErrorMessageId } from '@/lib/resolve-image-upload-error'
import { collapseTagsIssuePaths } from '@/lib/collapse-tags-issue-paths'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'
import { ApiError } from '@keimelion/sdk/client'
import type { AdminItemDetailParsed, AdminItemsUpdateRequestInput } from '@keimelion/sdk/schemas'

const UPDATE_ITEM_ISSUE_PATHS = [
  'name',
  'description',
  'categories',
  'tags',
] as const

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: AdminItemDetailParsed
}

const EDITABLE_ITEM_FIELDS = ['name', 'description'] as const satisfies readonly (keyof ItemFormEditValues)[]

function haveSameUnorderedValues(
  before: readonly string[],
  after: readonly string[],
): boolean {
  if (before.length !== after.length) return false
  const sortedBefore = [...before].sort()
  const sortedAfter = [...after].sort()
  return sortedBefore.every((value, index) => value === sortedAfter[index])
}

export function EditItemDialog({
  open,
  onOpenChange,
  item,
}: EditItemDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateItem()

  function handleSubmit(
    values: ItemFormEditValues,
    setError: UseFormSetError<ItemFormEditValues>,
  ): void {
    const originalScalarFields: Pick<ItemFormEditValues, 'name' | 'description'> = {
      name: item.name,
      description: item.description,
    }
    const image = values.image ?? null
    const patch: AdminItemsUpdateRequestInput = pickChangedFields(
      originalScalarFields,
      values,
      EDITABLE_ITEM_FIELDS,
    )
    const originalCategoryIds = item.categories.map((category) => category.id)
    const submittedCategoryIds = values.categories ?? []
    if (!haveSameUnorderedValues(originalCategoryIds, submittedCategoryIds)) {
      patch.categories = submittedCategoryIds
    }
    const originalTagNames = item.tags.map((tag) => tag.name)
    const submittedTagNames = values.tags ?? []
    if (!haveSameUnorderedValues(originalTagNames, submittedTagNames)) {
      patch.tags = submittedTagNames
    }
    if (values.clearImage === true && image === null) {
      patch.clearImage = true
    }

    mutation.mutate(
      { id: item.id, input: patch, image },
      {
        onSuccess: (updated) => {
          notifySuccess({ title: translate('items.mutation.updated_toast', { name: updated.name }) })
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
              UPDATE_ITEM_ISSUE_PATHS,
            )
            if (appliedCount > 0) return
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
      title={t('items.admin.edit_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <div className="flex flex-col gap-4">
        <ItemForm
          mode="edit"
          item={item}
          onSubmit={handleSubmit}
          onDirtyChange={setIsFormDirty}
          isPending={mutation.isPending}
        />
        <ItemSourcesManager item={item} />
        <ItemReservationsSection itemId={item.id} />
      </div>
    </FormDialog>
  )
}
