import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import type { ApiUser } from '@/data-access/auth/auth.api'
import { apiGet, apiPatch, apiDelete } from '@/lib/api-client'

export interface ListUsersParams {
  page?: number
  limit?: number
}

export interface UpdateUserInput {
  username?: string
  role?: string
  isMarketingOptedIn?: boolean
}

export function fetchUsers(params: ListUsersParams): Promise<PaginatedResponse<ApiUser>> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  return apiGet<PaginatedResponse<ApiUser>>(`/admin/users?${query.toString()}`)
}

export function fetchUser(userId: string): Promise<{ user: ApiUser }> {
  return apiGet<{ user: ApiUser }>(`/admin/users/${userId}`)
}

export function updateUser(userId: string, input: UpdateUserInput): Promise<{ user: ApiUser }> {
  return apiPatch<{ user: ApiUser }>(`/admin/users/${userId}`, input)
}

export function deleteUser(userId: string): Promise<void> {
  return apiDelete(`/admin/users/${userId}`)
}
