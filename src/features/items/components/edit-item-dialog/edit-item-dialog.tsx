'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import { ItemForm } from '@/features/items/components/item-form'
import type { ItemFormValues } from '@/features/items/components/item-form'
import { useUpdateItem } from '@/features/items/hooks/use-item-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ApiAdminItem
}

function buildInitialValues(item: ApiAdminItem): ItemFormValues {
  return {
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    moderationStatus: item.moderationStatus,
  }
}

export function EditItemDialog({ open, onOpenChange, item }: EditItemDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateItem()

  function handleSubmit(values: ItemFormValues, setError: UseFormSetError<ItemFormValues>): void {
    mutation.mutate(
      { id: item.id, input: values },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('items.mutation.updated_toast') })
          onOpenChange(false)
        },
        onError: (error) => {
          setError('root', { message: error.message })
        },
      },
    )
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('items.edit.dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ItemForm
        mode="edit"
        initialValues={buildInitialValues(item)}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
