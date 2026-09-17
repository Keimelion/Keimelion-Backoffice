import { z } from 'zod'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import { buildQueryParams } from '@/data-access/_shared/query-params'
import { apiUserSchema } from '@/data-access/_shared/user'

const SORT_VALUES = [
  'createdAt:desc',
  'createdAt:asc',
  'email:asc',
  'email:desc',
  'username:asc',
  'username:desc',
  'lastActiveAt:asc',
  'lastActiveAt:desc',
] as const

export const adminUserSchema = apiUserSchema.extend({
  bannedAt: z.string().nullable(),
  banReason: z.string().nullable(),
  deletedAt: z.string().nullable(),
})

export type AdminApiUser = z.infer<typeof adminUserSchema>

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().catch(20),
  email: z.string().optional(),
  username: z.string().optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

const listUsersResponseSchema = z.object({
  items: z.array(adminUserSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>

export async function listUsers(
  input: Partial<ListUsersQuery>,
): Promise<PaginatedResponse<AdminApiUser>> {
  const response = await axiosInstance.get<unknown>('/admin/users', {
    params: buildQueryParams(input),
  })
  return parseApiResponse(listUsersResponseSchema, response, 'users')
}
