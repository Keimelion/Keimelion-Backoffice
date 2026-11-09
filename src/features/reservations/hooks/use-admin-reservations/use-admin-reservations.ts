'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  RESERVATIONS_QUERY_KEY,
  listAdminReservations,
} from '@/data-access/reservations/reservations.api'
import type { ListAdminReservationsQuery } from '@/features/reservations/reservations.input-schemas'
import type { AdminReservationsListResponseParsed } from '@keimelion/sdk/schemas'

type ReservationsFilters = Partial<ListAdminReservationsQuery>

export function buildAdminReservationsKey(
  filters: ReservationsFilters,
): readonly ['reservations', 'list', ReservationsFilters] {
  const normalized = normalizeFilters(filters)
  return [...RESERVATIONS_QUERY_KEY, 'list', normalized] as const
}

interface UseAdminReservationsOptions {
  enabled?: boolean
}

export function useAdminReservations(
  filters: ReservationsFilters,
  options: UseAdminReservationsOptions = {},
): UseQueryResult<AdminReservationsListResponseParsed> {
  return useQuery({
    queryKey: buildAdminReservationsKey(filters),
    queryFn: () => listAdminReservations(filters),
    enabled: options.enabled ?? true,
  })
}
