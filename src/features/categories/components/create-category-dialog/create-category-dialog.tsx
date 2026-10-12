'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { CategoryForm } from '@/features/categories/components/category-form'
import type { CategoryFormValues } from '@/features/categories/components/category-form'
import { useCreateCategory } from '@/features/categories/hooks/use-admin-categories'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

const CODE_MAX_DEPTH = 'CATEGORY_MAX_DEPTH_EXCEEDED'

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
}: CreateCategoryDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateCategory()

  function handleSubmit(
    values: CategoryFormValues,
    setError: UseFormSetError<CategoryFormValues>,
  ): void {
    mutation.mutate(values, {
      onSuccess: () => {
        notifySuccess({ title: translate('categories.mutation.created_toast', { name: values.name }) })
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
        setError('root', { message: error.message })
      },
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('categories.admin.create_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <CategoryForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
