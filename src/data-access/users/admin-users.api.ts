import type { UserRole, UserStatus } from '@keimelion/sdk/enums'
import type {
  AdminUserDetailParsed,
  AdminUsersCreateRequestInput,
  AdminUsersListFilters,
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
  status?: readonly UserStatus[] | undefined
  sort?: string | undefined
}

type StatusFilterQuery = Pick<AdminUsersListFilters, 'status[eq]' | 'status[in][]'>

export async function listUsers(input: ListUsersParams): Promise<AdminUsersListResponseParsed> {
  return apiClient.admin.users.list({
    page: input.page,
    limit: input.limit,
    sort: input.sort,
    'id[eq]': input.id,
    'email[ilike]': emptyToUndefined(input.email),
    'username[ilike]': emptyToUndefined(input.username),
    'role[eq]': input.role,
    ...buildStatusFilter(input.status ?? []),
  })
}

export function buildStatusFilter(statuses: readonly UserStatus[]): StatusFilterQuery {
  const [onlyStatus, ...otherStatuses] = statuses
  if (onlyStatus === undefined) return {}
  if (otherStatuses.length === 0) return { 'status[eq]': onlyStatus }
  return { 'status[in][]': statuses }
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

export async function resendStaffInvitation(id: string): Promise<AdminUserDetailParsed> {
  const { user } = await apiClient.admin.users.resendInvitation(id)
  return user
}
