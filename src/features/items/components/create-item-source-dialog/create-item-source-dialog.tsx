'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemSourceForm } from '@/features/items/components/item-source-form'
import type { ItemSourceFormValues } from '@/features/items/components/item-source-form'
import { useCreateItemSource } from '@/features/items/hooks/use-item-source-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface CreateItemSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
}

export function CreateItemSourceDialog({
  open,
  onOpenChange,
  itemId,
}: CreateItemSourceDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateItemSource()

  function handleSubmit(values: ItemSourceFormValues, setError: UseFormSetError<ItemSourceFormValues>): void {
    mutation.mutate(
      { itemId, input: values },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('items.source_mutation.created_toast') })
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
      title={t('items.source_create.dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ItemSourceForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
