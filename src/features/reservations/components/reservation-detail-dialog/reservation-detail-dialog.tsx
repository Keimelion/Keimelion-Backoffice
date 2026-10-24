'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ItemThumbnail } from '@/features/items/components/item-thumbnail'
import { CancelReservationDialog } from '@/features/reservations/components/cancel-reservation-dialog'
import type { ApiAdminReservation } from '@/data-access/reservations/reservations.schemas'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'

interface ReservationDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ApiAdminReservation
}

export function ReservationDetailDialog({
  open,
  onOpenChange,
  reservation,
}: ReservationDetailDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isCancelOpen, setIsCancelOpen] = useState<boolean>(false)

  const reserverName = reservation.user.username ?? reservation.user.email
  const ownerName = resolveOwnerLabel(reservation, t)

  function handleCancelled(): void {
    setIsCancelOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[calc(100vh-2rem)] max-w-xl flex-col">
          <DialogHeader>
            <DialogTitle>{t('reservations.detail.title')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('reservations.list.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <DetailRow label={t('reservations.detail.reserver_label')}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{reserverName}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {reservation.user.id}
                </span>
              </div>
            </DetailRow>

            <DetailRow label={t('reservations.detail.item_label')}>
              <div className="flex items-center gap-3">
                <ItemThumbnail
                  imageUrl={reservation.listItem.image?.urls.sm ?? null}
                  alt={reservation.listItem.name}
                  size="md"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{reservation.listItem.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {reservation.listItem.id}
                  </span>
                </div>
              </div>
            </DetailRow>

            <DetailRow label={t('reservations.detail.list_label')}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{reservation.list.title}</span>
                <span className="text-xs text-muted-foreground">
                  {reservation.list.slug}
                  {' · '}
                  {ownerName}
                </span>
              </div>
            </DetailRow>

            <DetailRow label={t('reservations.detail.quantity_label')}>
              <span className="text-sm">{reservation.quantityBooked}</span>
            </DetailRow>

            <DetailRow label={t('reservations.detail.created_at_label')}>
              <span className="text-sm">{formatDate(reservation.createdAt)}</span>
            </DetailRow>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { onOpenChange(false) }}>
              {t('reservations.detail.close_button')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => { setIsCancelOpen(true) }}
            >
              {t('reservations.detail.cancel_button')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CancelReservationDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        reservation={reservation}
        onCancelled={handleCancelled}
      />
    </>
  )
}

interface DetailRowProps {
  label: string
  children: React.ReactNode
}

function DetailRow({ label, children }: DetailRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

function resolveOwnerLabel(reservation: ApiAdminReservation, t: TranslateFn): string {
  if (reservation.list.owner === null) return t('reservations.table.list_owner_none')
  const owner = reservation.list.owner.username ?? reservation.list.owner.email
  return t('reservations.table.list_owner', { owner })
}
