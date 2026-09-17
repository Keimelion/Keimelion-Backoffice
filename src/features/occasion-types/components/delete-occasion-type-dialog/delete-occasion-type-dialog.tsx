'use client'

import { useQueryClient, useMutation } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { deleteOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

type DeleteResult = undefined

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
  const t = useTranslate()
  const queryClient = useQueryClient()

  const mutation = useMutation<DeleteResult, Error, string>({
    mutationFn: async (id) => {
      await deleteOccasionType(id)
      return undefined
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['occasion-types'] })
      notifySuccess({ title: translate('occasion_types.mutation.deleted_toast') })
      onOpenChange(false)
    },
  })

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(occasionTypeId)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('occasion_types.admin.delete_dialog_title')}
      description={t('occasion_types.admin.delete_dialog_description', { label })}
      confirmLabel={t('occasion_types.admin.delete_dialog_confirm')}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
