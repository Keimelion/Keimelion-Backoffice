'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import {
  RESERVATIONS_QUERY_KEY,
  fetchAdminReservation,
} from '@/data-access/reservations/reservations.api'
import type { ApiAdminReservation } from '@/data-access/reservations/reservations.schemas'

export function buildAdminReservationKey(
  id: string,
): readonly ['reservations', 'detail', string] {
  return [...RESERVATIONS_QUERY_KEY, 'detail', id] as const
}

const DISABLED_ADMIN_RESERVATION_KEY = [...RESERVATIONS_QUERY_KEY, 'detail', null] as const

export function useAdminReservation(id: string | null): UseQueryResult<ApiAdminReservation> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_RESERVATION_KEY : buildAdminReservationKey(id),
    queryFn: () => fetchAdminReservation(id ?? ''),
    enabled: id !== null,
  })
}
