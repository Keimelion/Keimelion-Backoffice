import { z } from 'zod'
import { AUTH_PROVIDER_VALUES } from '@keimelion/api/shared/enums/auth-provider'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'

/**
 * Zod validator for the API's User shape. Shared across resources — used by
 * auth-storage (fail-close on tampered localStorage), by auth response
 * schemas (login, register, refresh…), and by any future admin/user endpoint
 * that returns a User payload.
 */
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
