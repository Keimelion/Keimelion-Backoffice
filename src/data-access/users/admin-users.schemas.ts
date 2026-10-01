import { z } from 'zod'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import { basePaginationShape } from '@/data-access/_shared/pagination'
import { apiUserSchema } from '@/data-access/_shared/user'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 30

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
  ...basePaginationShape,
  email: z.string().optional(),
  username: z.string().optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

export const listUsersResponseSchema = z.object({
  items: z.array(adminUserSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>

export const adminUserMutationResponseSchema = z.object({
  user: adminUserSchema,
})

export type AdminUserMutationResponse = z.infer<typeof adminUserMutationResponseSchema>
export type AdminUserMutationUser = z.infer<typeof adminUserSchema>

export const createAdminUserInputSchema = z
  .object({
    email: z.email(),
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH)
      .max(USERNAME_MAX_LENGTH)
      .nullable()
      .optional(),
    role: z.enum(USER_ROLE_VALUES),
  })
  .strict()

export type CreateAdminUserInput = z.infer<typeof createAdminUserInputSchema>

export const updateAdminUserInputSchema = z
  .object({
    role: z.enum(USER_ROLE_VALUES),
  })
  .strict()

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserInputSchema>
