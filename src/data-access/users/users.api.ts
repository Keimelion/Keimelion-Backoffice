import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { ApiRequestError, apiGet } from '@/data-access/_client'
import type { AdminApiUser } from '@/data-access/_schemas/admin-user'
import { listUsersResponseSchema, type ListUsersQuery } from '@/data-access/users/users.schemas'

export async function fetchUsers(params: Partial<ListUsersQuery>): Promise<PaginatedResponse<AdminApiUser>> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.email) query.set('email', params.email)
  if (params.username) query.set('username', params.username)
  if (params.role) query.set('role', params.role)
  if (params.sort) query.set('sort', params.sort)

  const raw = await apiGet<unknown>(`/admin/users?${query.toString()}`)
  const parsed = listUsersResponseSchema.safeParse(raw)
  if (!parsed.success) {
    throw new ApiRequestError(
      'INVALID_RESPONSE',
      'The server returned an unexpected users payload.',
      200,
    )
  }
  return parsed.data
}
