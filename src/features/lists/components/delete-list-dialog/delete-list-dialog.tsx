'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteList } from '@/features/lists/hooks/use-admin-lists'
import type { ApiAdminList } from '@/data-access/lists/lists.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

interface DeleteListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: ApiAdminList
}

export function DeleteListDialog({
  open,
  onOpenChange,
  list,
}: DeleteListDialogProps): React.JSX.Element {
  const mutation = useDeleteList()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(list.id)
    notifySuccess({ title: translate('lists.mutation.deleted_toast', { title: list.title }) })
    onOpenChange(false)
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="lists.admin.delete_dialog"
      values={{ title: list.title }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
