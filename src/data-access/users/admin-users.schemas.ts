import { z } from 'zod'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import { adminUserSchema } from './list-users'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 30

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
