'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteItem } from '@/features/items/hooks/use-admin-items'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

interface DeleteItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ApiAdminItem
}

export function DeleteItemDialog({
  open,
  onOpenChange,
  item,
}: DeleteItemDialogProps): React.JSX.Element {
  const mutation = useDeleteItem()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(item.id)
    notifySuccess({ title: translate('items.mutation.deleted_toast', { name: item.name }) })
    onOpenChange(false)
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="items.admin.delete_dialog"
      values={{ name: item.name }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
