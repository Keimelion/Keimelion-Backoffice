import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminUserMutationResponseSchema,
  type AdminUserMutationUser,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from './admin-users.schemas'

export const ADMIN_USERS_QUERY_KEY = ['users'] as const

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
