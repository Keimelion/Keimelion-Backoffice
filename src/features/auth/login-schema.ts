import { z } from 'zod'
import { AUTH_PROVIDER_VALUES } from '@keimelion/api/shared/enums/auth-provider'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'

const MIN_PASSWORD_LENGTH = 1

export const loginInputSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(MIN_PASSWORD_LENGTH),
})

export const apiUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  authProvider: z.enum(AUTH_PROVIDER_VALUES),
  role: z.enum(USER_ROLE_VALUES),
  avatarUrl: z.string().nullable(),
  isCgvAccepted: z.boolean(),
  cgvAcceptedAt: z.string().nullable(),
  isMarketingOptedIn: z.boolean(),
  emailVerifiedAt: z.string().nullable(),
  lastActiveAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: apiUserSchema,
})

export type LoginInput = z.infer<typeof loginInputSchema>
export type LoginResponseParsed = z.infer<typeof loginResponseSchema>
