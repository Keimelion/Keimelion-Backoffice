import type { UserRole } from '@keimelion/sdk/enums'
import type {
  AdminUserDetailParsed,
  AdminUsersCreateRequestInput,
  AdminUsersListResponseParsed,
  AdminUsersUpdateRequestInput,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'
import { emptyToUndefined } from '@/data-access/_shared/query-params'

export const ADMIN_USERS_QUERY_KEY = ['users'] as const

export interface ListUsersParams {
  page?: number | undefined
  limit?: number | undefined
  id?: string | undefined
  email?: string | undefined
  username?: string | undefined
  role?: UserRole | undefined
  sort?: string | undefined
}

export async function listUsers(input: ListUsersParams): Promise<AdminUsersListResponseParsed> {
  return apiClient.admin.users.list({
    page: input.page,
    limit: input.limit,
    sort: input.sort,
    'id[eq]': input.id,
    'email[ilike]': emptyToUndefined(input.email),
    'username[ilike]': emptyToUndefined(input.username),
    'role[eq]': input.role,
  })
}

export async function createAdminUser(
  input: AdminUsersCreateRequestInput,
): Promise<AdminUserDetailParsed> {
  const { user } = await apiClient.admin.users.create(input)
  return user
}

export async function updateAdminUser(
  id: string,
  input: AdminUsersUpdateRequestInput,
): Promise<AdminUserDetailParsed> {
  const { user } = await apiClient.admin.users.update(id, input)
  return user
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.admin.users.delete(id)
}
