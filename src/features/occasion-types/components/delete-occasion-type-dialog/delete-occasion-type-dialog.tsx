'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteOccasionType } from '@/features/occasion-types/hooks/use-admin-occasion-types'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

interface DeleteOccasionTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occasionTypeId: string
  label: string
}

export function DeleteOccasionTypeDialog({
  open,
  onOpenChange,
  occasionTypeId,
  label,
}: DeleteOccasionTypeDialogProps): React.JSX.Element {
  const mutation = useDeleteOccasionType()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(occasionTypeId)
    notifySuccess({ title: translate('occasion_types.mutation.deleted_toast') })
    onOpenChange(false)
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="occasion_types.admin.delete_dialog"
      values={{ label }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
