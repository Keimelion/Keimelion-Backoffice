import { z } from 'zod'
import { USER_ROLE_VALUES, USER_STATUS_VALUES } from '@keimelion/sdk/enums'
import { ADMIN_USERS_SORT_FIELDS, adminUsersCreateRequestSchema } from '@keimelion/sdk/schemas'
import { basePaginationShape, buildSortValues } from '@/lib/list-query-input-schema'
import { MULTI_VALUE_SEPARATOR } from '@/lib/url-params'

const SORT_VALUES = buildSortValues(ADMIN_USERS_SORT_FIELDS)

const statusParamSchema = z
  .string()
  .transform((value) => value.split(MULTI_VALUE_SEPARATOR))
  .pipe(z.array(z.enum(USER_STATUS_VALUES)).min(1))

export const listUsersQuerySchema = z.object({
  ...basePaginationShape,
  id: z.uuid().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  status: statusParamSchema.optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

export const createAdminUserInputSchema = adminUsersCreateRequestSchema

export type CreateAdminUserInput = z.input<typeof createAdminUserInputSchema>

export const updateAdminUserInputSchema = z.strictObject({
  role: z.enum(USER_ROLE_VALUES),
})

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserInputSchema>

export const editUserFormResolverSchema = z.object({
  role: z.enum(USER_ROLE_VALUES),
})
