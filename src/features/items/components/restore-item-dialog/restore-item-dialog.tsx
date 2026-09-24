'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useRestoreItem } from '@/features/items/hooks/use-item-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

function suppressAlreadyToastedRejection(): void {
  return undefined
}

interface RestoreItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  itemName: string
}

export function RestoreItemDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: RestoreItemDialogProps): React.JSX.Element {
  const mutation = useRestoreItem()

  async function handleConfirm(): Promise<void> {
    try {
      await mutation.mutateAsync(itemId)
      notifySuccess({ title: translate('items.mutation.restored_toast') })
    } catch {
      suppressAlreadyToastedRejection()
    }
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="items.restore_dialog"
      values={{ name: itemName }}
      onConfirm={handleConfirm}
    />
  )
}
