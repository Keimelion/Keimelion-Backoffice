'use client'

import { useQueryClient, useMutation } from '@tanstack/react-query'
import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { OCCASION_TYPES_QUERY_KEY, deleteOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

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
  const queryClient = useQueryClient()

  const mutation = useMutation<DeleteResult, Error, string>({
    mutationFn: async (id) => {
      await deleteOccasionType(id)
      return undefined
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OCCASION_TYPES_QUERY_KEY })
      notifySuccess({ title: translate('occasion_types.mutation.deleted_toast') })
      onOpenChange(false)
    },
  })

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(occasionTypeId)
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
