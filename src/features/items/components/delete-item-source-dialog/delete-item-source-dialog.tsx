'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteItemSource } from '@/features/items/hooks/use-item-source-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

interface DeleteItemSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  sourceId: string
}

export function DeleteItemSourceDialog({
  open,
  onOpenChange,
  itemId,
  sourceId,
}: DeleteItemSourceDialogProps): React.JSX.Element {
  const mutation = useDeleteItemSource()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync({ itemId, sourceId })
    notifySuccess({ title: translate('items.source_mutation.deleted_toast') })
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="items.source_delete_dialog"
      onConfirm={handleConfirm}
      destructive
    />
  )
}
