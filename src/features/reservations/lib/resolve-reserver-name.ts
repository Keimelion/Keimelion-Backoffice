import type { AdminReservationDetailParsed } from '@keimelion/sdk/schemas'

const UNKNOWN_RESERVER_LABEL = '—'

export function resolveReserverName(reservation: AdminReservationDetailParsed): string {
  if (reservation.user !== null) return reservation.user.username ?? reservation.user.email
  return reservation.reserverName ?? reservation.reserverEmail ?? UNKNOWN_RESERVER_LABEL
}
