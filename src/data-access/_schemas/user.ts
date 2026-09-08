import { z } from 'zod'
import { AUTH_PROVIDER_VALUES } from '@keimelion/api/shared/enums/auth-provider'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'

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
