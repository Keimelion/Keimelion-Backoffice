import { z } from 'zod'
import { USER_ROLE_VALUES } from '@keimelion/sdk/enums'
import { adminUsersCreateRequestSchema } from '@keimelion/sdk/schemas'
import { basePaginationShape } from '@/data-access/_shared/pagination'

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
