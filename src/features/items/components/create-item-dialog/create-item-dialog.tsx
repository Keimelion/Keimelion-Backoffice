'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { ErrorCode } from '@keimelion/api/shared/enums/error-code'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemForm } from '@/features/items/components/item-form'
import type { ItemFormCreateValues } from '@/features/items/components/item-form'
import { useCreateItem } from '@/features/items/hooks/use-admin-items'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

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
    mutation.mutate(values, {
      onSuccess: () => {
        notifySuccess({ title: translate('items.mutation.created_toast', { name: values.name }) })
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
