import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { ApiRequestError, apiGet } from '@/data-access/_client'
import { buildListSearchParams } from '@/data-access/_list-query'
import type { AdminApiUser } from '@/data-access/_schemas/admin-user'
import { listUsersResponseSchema, type ListUsersQuery } from '@/data-access/users/users.schemas'

const USERS_FILTER_KEYS = ['email', 'username', 'role', 'sort'] as const

export async function fetchUsers(params: Partial<ListUsersQuery>): Promise<PaginatedResponse<AdminApiUser>> {
  const query = buildListSearchParams<ListUsersQuery>(params, USERS_FILTER_KEYS)
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
