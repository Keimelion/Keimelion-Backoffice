'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminReservations } from '@/features/reservations/hooks/use-admin-reservations'
import type { ApiAdminReservation } from '@/data-access/reservations/reservations.schemas'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'

const ITEM_RESERVATIONS_LIMIT = 50
const SKELETON_ROW_COUNT = 2
const SKELETON_OPACITY_STEP = 0.2

interface ItemReservationsSectionProps {
  itemId: string
}

export function ItemReservationsSection({
  itemId,
}: ItemReservationsSectionProps): React.JSX.Element {
  const t = useTranslate()
  const query = useAdminReservations({ itemId, page: 1, limit: ITEM_RESERVATIONS_LIMIT })
  const reservations = query.data?.items ?? []

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border bg-muted/20 p-4">
      <header className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">
          {t('reservations.item_section.title')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('reservations.item_section.description')}
        </p>
      </header>

      {query.isError ? (
        <p className="text-sm text-destructive">
          {t('reservations.item_section.load_error')}
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reservations.table.column.reserver')}</TableHead>
                <TableHead className="w-24">{t('reservations.table.column.quantity')}</TableHead>
                <TableHead className="w-28">{t('reservations.table.column.created_at')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading
                ? renderSkeletonRows()
                : renderRows(reservations, t)}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

function renderSkeletonRows(): React.ReactNode {
  return Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
    <TableRow key={index} style={{ opacity: 1 - index * SKELETON_OPACITY_STEP }}>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-24"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-28"><Skeleton className="h-4 w-full" /></TableCell>
    </TableRow>
  ))
}

function renderRows(
  reservations: ApiAdminReservation[],
  t: TranslateFn,
): React.ReactNode {
  if (reservations.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
          {t('reservations.item_section.empty')}
        </TableCell>
      </TableRow>
    )
  }

  return reservations.map((reservation) => (
    <TableRow key={reservation.id} className="hover:bg-transparent">
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {reservation.user.username ?? reservation.user.email}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {reservation.user.id}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-24 text-sm">{reservation.quantityBooked}</TableCell>
      <TableCell className="w-28 text-sm text-muted-foreground">
        {formatDate(reservation.createdAt)}
      </TableCell>
    </TableRow>
  ))
}
