'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { ErrorCode } from '@keimelion/api/shared/enums/error-code'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemForm } from '@/features/items/components/item-form'
import type { ItemFormEditValues } from '@/features/items/components/item-form'
import { ItemSourcesManager } from '@/features/items/components/item-sources-manager'
import { useUpdateItem } from '@/features/items/hooks/use-admin-items'
import type { ApiAdminItem, UpdateItemInput } from '@/data-access/items/items.schemas'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { applyApiValidationIssues } from '@/lib/apply-api-validation-issues'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'

const UPDATE_ITEM_ISSUE_PATHS = [
  'name',
  'description',
  'imageUrl',
  'categories',
] as const

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ApiAdminItem
}

const EDITABLE_ITEM_FIELDS = ['name', 'description', 'imageUrl'] as const satisfies readonly (keyof ItemFormEditValues)[]

function haveSameCategoryIds(
  before: readonly string[],
  after: readonly string[],
): boolean {
  if (before.length !== after.length) return false
  const sortedBefore = [...before].sort()
  const sortedAfter = [...after].sort()
  return sortedBefore.every((id, index) => id === sortedAfter[index])
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
    const originalScalarFields: Pick<ItemFormEditValues, 'name' | 'description' | 'imageUrl'> = {
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
    }
    const patch: UpdateItemInput = pickChangedFields(
      originalScalarFields,
      values,
      EDITABLE_ITEM_FIELDS,
    )
    const originalCategoryIds = item.categories.map((category) => category.id)
    const submittedCategoryIds = values.categories ?? []
    if (!haveSameCategoryIds(originalCategoryIds, submittedCategoryIds)) {
      patch.categories = submittedCategoryIds
    }

    mutation.mutate(
      { id: item.id, input: patch },
      {
        onSuccess: (updated) => {
          notifySuccess({ title: translate('items.mutation.updated_toast', { name: updated.name }) })
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
            setError('name', { message: t('items.form.error.conflict') })
            return
          }
          if (
            error instanceof ApiRequestError
            && error.code === ErrorCode.CATEGORY_NOT_FOUND
          ) {
            setError('categories', { message: t('items.form.error.category_not_found') })
            return
          }
          if (
            error instanceof ApiRequestError
            && error.code === ErrorCode.UNPROCESSABLE_ENTITY
            && error.issues !== null
          ) {
            const appliedCount = applyApiValidationIssues(
              error.issues,
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
      </div>
    </FormDialog>
  )
}
