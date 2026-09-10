import { z } from 'zod'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import { adminUserSchema } from '@/data-access/_shared/schemas/admin-user'

const SORT_VALUES = ['createdAt:desc', 'createdAt:asc'] as const

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().catch(20),
  email: z.string().optional(),
  username: z.string().optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export const listUsersResponseSchema = z.object({
  items: z.array(adminUserSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
