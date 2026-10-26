'use client'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import type { ApiAdminReservation } from '@/data-access/reservations/reservations.schemas'
import { useDeleteAdminReservation } from '@/features/reservations/hooks/use-delete-admin-reservation'
import { translate } from '@/lib/i18n/translate'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface CancelReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ApiAdminReservation
  onCancelled?: () => void
}

export function CancelReservationDialog({
  open,
  onOpenChange,
  reservation,
  onCancelled,
}: CancelReservationDialogProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useDeleteAdminReservation()

  const reserverName = reservation.user.username ?? reservation.user.email

  async function handleConfirm(): Promise<void> {
    await new Promise<void>((resolve) => {
      mutation.mutate(reservation.id, {
        onSuccess: () => {
          notifySuccess({ title: translate('reservations.cancel_dialog.success_toast') })
          onCancelled?.()
          resolve()
        },
        onError: (error) => {
          notifyError(error)
          resolve()
        },
      })
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('reservations.cancel_dialog.title')}
      description={t('reservations.cancel_dialog.description', {
        reserver: reserverName,
        item: reservation.listItem.name,
      })}
      confirmLabel={t('reservations.cancel_dialog.confirm')}
      cancelLabel={t('reservations.cancel_dialog.cancel')}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
