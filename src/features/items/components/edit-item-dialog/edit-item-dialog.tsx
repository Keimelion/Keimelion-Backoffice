'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { ItemForm } from '@/features/items/components/item-form'
import type { ItemFormEditValues } from '@/features/items/components/item-form'
import { useUpdateItem } from '@/features/items/hooks/use-admin-items'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ApiAdminItem
}

const EDITABLE_ITEM_FIELDS = ['name', 'description', 'imageUrl'] as const satisfies readonly (keyof ItemFormEditValues)[]

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
    mutation.mutate(
      { id: item.id, input: pickChangedFields(item, values, EDITABLE_ITEM_FIELDS) },
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
      <ItemForm
        mode="edit"
        item={item}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
