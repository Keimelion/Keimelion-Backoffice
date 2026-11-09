import type {
  AdminReservationDetailParsed,
  AdminReservationsListQueryInput,
  AdminReservationsListResponseParsed,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

export const RESERVATIONS_QUERY_KEY = ['reservations'] as const

export async function listAdminReservations(
  input: AdminReservationsListQueryInput,
): Promise<AdminReservationsListResponseParsed> {
  return apiClient.admin.reservations.list(input)
}

export async function fetchAdminReservation(id: string): Promise<AdminReservationDetailParsed> {
  const { reservation } = await apiClient.admin.reservations.get(id)
  return reservation
}

export async function deleteAdminReservation(id: string): Promise<void> {
  await apiClient.admin.reservations.delete(id)
}
