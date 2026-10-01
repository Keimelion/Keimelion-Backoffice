import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import { buildQueryParams } from '@/data-access/_shared/query-params'
import {
  adminUserMutationResponseSchema,
  listUsersResponseSchema,
  type AdminApiUser,
  type AdminUserMutationUser,
  type CreateAdminUserInput,
  type ListUsersQuery,
  type UpdateAdminUserInput,
} from './admin-users.schemas'

export const ADMIN_USERS_QUERY_KEY = ['users'] as const

export async function listUsers(
  input: Partial<ListUsersQuery>,
): Promise<PaginatedResponse<AdminApiUser>> {
  const response = await axiosInstance.get<unknown>('/admin/users', {
    params: buildQueryParams(input),
  })
  return parseApiResponse(listUsersResponseSchema, response, 'users')
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<AdminUserMutationUser> {
  const response = await axiosInstance.post<unknown>('/admin/users', input)
  const parsed = parseApiResponse(adminUserMutationResponseSchema, response, 'admin user')
  return parsed.user
}

export async function updateAdminUser(
  id: string,
  input: UpdateAdminUserInput,
): Promise<AdminUserMutationUser> {
  const response = await axiosInstance.patch<unknown>(`/admin/users/${id}`, input)
  const parsed = parseApiResponse(adminUserMutationResponseSchema, response, 'admin user')
  return parsed.user
}

export async function deleteAdminUser(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/users/${id}`)
}
