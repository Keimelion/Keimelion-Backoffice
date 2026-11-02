'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { CategoryForm } from '@/features/categories/components/category-form'
import type { CategoryFormValues } from '@/features/categories/components/category-form'
import { useUpdateCategory } from '@/features/categories/hooks/use-admin-categories'
import { pickTranslation } from '@/features/categories/lib/resolve-category-name'
import type { ApiCategory, UpdateCategoryInput } from '@/data-access/categories/categories.schemas'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

const CODE_MAX_DEPTH = 'CATEGORY_MAX_DEPTH_EXCEEDED'
const CODE_CYCLE = 'CATEGORY_CYCLE_DETECTED'

interface EditCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ApiCategory
}

function buildCategoryPatch(
  category: ApiCategory,
  values: CategoryFormValues,
): UpdateCategoryInput {
  const patch: UpdateCategoryInput = {}
  const changedTranslations: { fr?: string; en?: string } = {}
  if (values.name.fr !== (category.translations.fr ?? '')) {
    changedTranslations.fr = values.name.fr
  }
  if (values.name.en !== (category.translations.en ?? '')) {
    changedTranslations.en = values.name.en
  }
  if (changedTranslations.fr !== undefined || changedTranslations.en !== undefined) {
    patch.name = changedTranslations
  }
  if (values.slug !== category.slug) patch.slug = values.slug
  if (values.parentId !== category.parentId) patch.parentId = values.parentId
  return patch
}

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
}: EditCategoryDialogProps): React.JSX.Element {
  const t = useTranslate()
  const locale = useLocaleStore((state) => state.locale)
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateCategory()

  function handleSubmit(
    values: CategoryFormValues,
    setError: UseFormSetError<CategoryFormValues>,
  ): void {
    const patch = buildCategoryPatch(category, values)
    mutation.mutate(
      { id: category.id, input: patch },
      {
        onSuccess: () => {
          const updatedName = pickTranslation(values.name, locale)
          notifySuccess({
            title: translate('categories.mutation.updated_toast', { name: updatedName }),
          })
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
