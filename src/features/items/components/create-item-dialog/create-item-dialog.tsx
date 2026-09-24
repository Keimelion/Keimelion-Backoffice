'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemForm } from '@/features/items/components/item-form'
import type { ItemFormValues } from '@/features/items/components/item-form'
import { useCreateItem } from '@/features/items/hooks/use-item-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateItemDialog({ open, onOpenChange }: CreateItemDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateItem()

  function handleSubmit(values: ItemFormValues, setError: UseFormSetError<ItemFormValues>): void {
    mutation.mutate(values, {
      onSuccess: () => {
        notifySuccess({ title: translate('items.mutation.created_toast') })
        onOpenChange(false)
      },
      onError: (error) => {
        setError('root', { message: error.message })
      },
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('items.create.dialog_title')}
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
