'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { CategoryForm } from '@/features/categories/components/category-form'
import type { CategoryFormValues } from '@/features/categories/components/category-form'
import { useUpdateCategory } from '@/features/categories/hooks/use-admin-categories'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'

const CODE_MAX_DEPTH = 'CATEGORY_MAX_DEPTH_EXCEEDED'
const CODE_CYCLE = 'CATEGORY_CYCLE_DETECTED'

const EDITABLE_CATEGORY_FIELDS = [
  'name',
  'slug',
  'parentId',
] as const satisfies readonly (keyof CategoryFormValues)[]

interface EditCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ApiCategory
}

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
}: EditCategoryDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateCategory()

  function handleSubmit(
    values: CategoryFormValues,
    setError: UseFormSetError<CategoryFormValues>,
  ): void {
    const patch = pickChangedFields(category, values, EDITABLE_CATEGORY_FIELDS)
    mutation.mutate(
      { id: category.id, input: patch },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('categories.mutation.updated_toast', { name: values.name }) })
          onOpenChange(false)
        },
        onError: (error) => {
          if (!(error instanceof ApiRequestError)) {
            setError('root', { message: error.message })
            return
          }
          if (error.status === HttpStatus.CONFLICT) {
            setError('slug', { message: t('categories.form.error.slug_conflict') })
            return
          }
          if (error.code === CODE_MAX_DEPTH) {
            setError('root', { message: t('categories.form.error.max_depth') })
            return
          }
          if (error.code === CODE_CYCLE) {
            setError('root', { message: t('categories.form.error.cycle_detected') })
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
      title={t('categories.admin.edit_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <CategoryForm
        mode="edit"
        category={category}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
