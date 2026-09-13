import { z } from 'zod'
import { AUTH_PROVIDER_VALUES } from '@keimelion/api/shared/enums/auth-provider'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'

const ALLOWED_AVATAR_URL_PROTOCOLS: readonly string[] = ['http:', 'https:']

const safeAvatarUrlSchema = z
  .string()
  .nullable()
  .transform((value): string | null => {
    if (value === null) return null
    try {
      const parsed = new URL(value)
      if (!ALLOWED_AVATAR_URL_PROTOCOLS.includes(parsed.protocol)) return null
      return value
    } catch {
      return null
    }
  })

export const apiUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  authProvider: z.enum(AUTH_PROVIDER_VALUES),
  role: z.enum(USER_ROLE_VALUES),
  avatarUrl: safeAvatarUrlSchema,
  isCgvAccepted: z.boolean(),
  cgvAcceptedAt: z.string().nullable(),
  isMarketingOptedIn: z.boolean(),
  emailVerifiedAt: z.string().nullable(),
  lastActiveAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ApiUser = z.infer<typeof apiUserSchema>
