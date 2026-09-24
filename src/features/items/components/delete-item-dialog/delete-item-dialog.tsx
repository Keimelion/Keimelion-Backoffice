'use client'

import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { useSoftDeleteItem } from '@/features/items/hooks/use-item-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifyError, notifySuccess } from '@/lib/notify'

interface DeleteItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  itemName: string
}

function isConflictWithMessage(error: unknown): error is ApiRequestError & { metadata: { message: string } } {
  return (
    error instanceof ApiRequestError &&
    error.status === HttpStatus.CONFLICT &&
    typeof error.metadata?.message === 'string'
  )
}

export function DeleteItemDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: DeleteItemDialogProps): React.JSX.Element {
  const mutation = useSoftDeleteItem()

  async function handleConfirm(): Promise<void> {
    try {
      await mutation.mutateAsync(itemId)
      notifySuccess({ title: translate('items.mutation.deleted_toast') })
    } catch (error) {
      if (isConflictWithMessage(error)) {
        notifyError({ title: error.metadata.message })
        return
      }
      if (error instanceof Error) {
        notifyError(error)
      }
    }
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="items.delete_dialog"
      values={{ name: itemName }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
