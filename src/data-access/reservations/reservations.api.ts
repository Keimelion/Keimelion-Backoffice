import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminReservationGetResponseSchema,
  adminReservationsListResponseSchema,
  type AdminReservationsListResponse,
  type ApiAdminReservation,
  type ListAdminReservationsQuery,
} from './reservations.schemas'

export const RESERVATIONS_QUERY_KEY = ['reservations'] as const

function buildListParams(input: Partial<ListAdminReservationsQuery>): Record<string, string> {
  const params: Record<string, string> = {}
  if (input.page !== undefined) params.page = String(input.page)
  if (input.limit !== undefined) params.limit = String(input.limit)
  if (input.userId !== undefined) params.userId = input.userId
  if (input.listId !== undefined) params.listId = input.listId
  if (input.listItemId !== undefined) params.listItemId = input.listItemId
  if (input.itemId !== undefined) params.itemId = input.itemId
  if (input.sort !== undefined) params.sort = input.sort
  return params
}

export async function listAdminReservations(
  input: Partial<ListAdminReservationsQuery>,
): Promise<AdminReservationsListResponse> {
  const response = await axiosInstance.get<unknown>('/admin/reservations', {
    params: buildListParams(input),
  })
  return parseApiResponse(adminReservationsListResponseSchema, response, 'admin reservations')
}

export async function fetchAdminReservation(id: string): Promise<ApiAdminReservation> {
  const response = await axiosInstance.get<unknown>(`/admin/reservations/${id}`)
  const parsed = parseApiResponse(
    adminReservationGetResponseSchema,
    response,
    'admin reservation',
  )
  return parsed.reservation
}

export async function deleteAdminReservation(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/reservations/${id}`)
}
