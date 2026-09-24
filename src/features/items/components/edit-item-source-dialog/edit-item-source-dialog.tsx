'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'
import { ItemSourceForm } from '@/features/items/components/item-source-form'
import type { ItemSourceFormValues } from '@/features/items/components/item-source-form'
import { useUpdateItemSource } from '@/features/items/hooks/use-item-source-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface EditItemSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  source: ApiItemSource
}

function buildInitialValues(source: ApiItemSource): ItemSourceFormValues {
  return {
    shopId: source.shopId,
    sourceUrl: source.sourceUrl,
    price: source.price,
    currency: source.currency,
    isPrimary: source.isPrimary,
  }
}

export function EditItemSourceDialog({
  open,
  onOpenChange,
  itemId,
  source,
}: EditItemSourceDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateItemSource()

  function handleSubmit(values: ItemSourceFormValues, setError: UseFormSetError<ItemSourceFormValues>): void {
    mutation.mutate(
      { itemId, sourceId: source.id, input: values },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('items.source_mutation.updated_toast') })
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
      title={t('items.source_edit.dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ItemSourceForm
        mode="edit"
        initialValues={buildInitialValues(source)}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
