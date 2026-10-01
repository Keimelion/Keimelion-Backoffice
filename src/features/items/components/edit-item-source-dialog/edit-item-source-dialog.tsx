'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemSourceForm } from '@/features/items/components/item-source-form'
import type { ItemSourceFormValues } from '@/features/items/components/item-source-form'
import { useUpdateItemSource } from '@/features/items/hooks/use-item-source-mutations'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'

interface EditItemSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  source: ApiItemSource
  disabledShopIds?: ReadonlySet<string> | undefined
}

const EDITABLE_SOURCE_FIELDS = ['shopId', 'sourceUrl', 'price', 'currency'] as const satisfies readonly (keyof ItemSourceFormValues)[]

export function EditItemSourceDialog({
  open,
  onOpenChange,
  itemId,
  source,
  disabledShopIds,
}: EditItemSourceDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateItemSource()

  function handleSubmit(
    values: ItemSourceFormValues,
    setError: UseFormSetError<ItemSourceFormValues>,
  ): void {
    const patch = pickChangedFields(
      {
        shopId: source.shopId,
        sourceUrl: source.sourceUrl,
        price: source.price,
        currency: source.currency,
      },
      values,
      EDITABLE_SOURCE_FIELDS,
    )
    mutation.mutate(
      { itemId, sourceId: source.id, input: patch },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('items.sources.mutation.updated_toast') })
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
      title={t('items.sources.edit_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ItemSourceForm
        mode="edit"
        source={source}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
        disabledShopIds={disabledShopIds}
      />
    </FormDialog>
  )
}
