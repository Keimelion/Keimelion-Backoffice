'use client'

import { HttpStatus } from '@keimelion/sdk/enums'
import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteItemSource } from '@/features/items/hooks/use-item-source-mutations'
import { translate } from '@/lib/i18n/translate'
import { notifyError, notifySuccess } from '@/lib/notify'
import { ApiError } from '@keimelion/sdk/client'
import type { ItemSourceDetailParsed } from '@keimelion/sdk/schemas'

interface DeleteItemSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  source: ItemSourceDetailParsed
}

export function DeleteItemSourceDialog({
  open,
  onOpenChange,
  itemId,
  source,
}: DeleteItemSourceDialogProps): React.JSX.Element {
  const mutation = useDeleteItemSource()

  async function handleConfirm(): Promise<void> {
    try {
      await mutation.mutateAsync({ itemId, sourceId: source.id })
      notifySuccess({ title: translate('items.sources.mutation.deleted_toast') })
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError && error.status === HttpStatus.CONFLICT) {
        notifyError({ title: translate('items.form.error.last_source_cannot_be_removed') })
        return
      }
      if (error instanceof Error) {
        notifyError(error)
        return
      }
      throw error
    }
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="items.sources.delete_dialog"
      onConfirm={handleConfirm}
      destructive
    />
  )
}
