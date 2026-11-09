import { z } from 'zod'
import { USER_ROLE_VALUES } from '@keimelion/sdk/enums'
import { ADMIN_USERS_SORT_FIELDS, adminUsersCreateRequestSchema } from '@keimelion/sdk/schemas'
import { basePaginationShape, buildSortValues } from '@/lib/list-query-input-schema'

const SORT_VALUES = buildSortValues(ADMIN_USERS_SORT_FIELDS)

export const listUsersQuerySchema = z.object({
  ...basePaginationShape,
  id: z.uuid().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

export const createAdminUserInputSchema = adminUsersCreateRequestSchema

export type CreateAdminUserInput = z.input<typeof createAdminUserInputSchema>

export const updateAdminUserInputSchema = z.strictObject({
  role: z.enum(USER_ROLE_VALUES),
})

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserInputSchema>
