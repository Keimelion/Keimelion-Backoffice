'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteTag } from '@/features/tags/hooks/use-admin-tags'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import type { TagSummaryParsed } from '@keimelion/sdk/schemas'

interface DeleteTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: TagSummaryParsed
}

export function DeleteTagDialog({
  open,
  onOpenChange,
  tag,
}: DeleteTagDialogProps): React.JSX.Element {
  const mutation = useDeleteTag()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(tag.id)
    notifySuccess({ title: translate('tags.mutation.deleted_toast', { name: tag.name }) })
    onOpenChange(false)
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="tags.admin.delete_dialog"
      values={{ name: tag.name }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
