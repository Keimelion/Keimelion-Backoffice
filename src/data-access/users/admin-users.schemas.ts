import { z } from 'zod'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 30
const DISPLAY_NAME_MAX_LENGTH = 60

export const adminUserMutationUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  role: z.enum(USER_ROLE_VALUES),
  avatarUrl: z.string().nullable(),
  isCgvAccepted: z.boolean(),
  cgvAcceptedAt: z.string().nullable(),
  isMarketingOptedIn: z.boolean(),
  emailVerifiedAt: z.string().nullable(),
  lastActiveAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  bannedAt: z.string().nullable(),
  banReason: z.string().nullable(),
  deletedAt: z.string().nullable(),
})

export type AdminUserMutationUser = z.infer<typeof adminUserMutationUserSchema>

export const adminUserMutationResponseSchema = z.object({
  user: adminUserMutationUserSchema,
})

export type AdminUserMutationResponse = z.infer<typeof adminUserMutationResponseSchema>

export const createAdminUserInputSchema = z
  .object({
    email: z.email(),
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH)
      .max(USERNAME_MAX_LENGTH)
      .nullable()
      .optional(),
    displayName: z.string().max(DISPLAY_NAME_MAX_LENGTH).nullable().optional(),
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
