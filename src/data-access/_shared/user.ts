import { z } from 'zod'
import { AUTH_PROVIDER_VALUES } from '@keimelion/api/shared/enums/auth-provider'
import { SUPPORTED_CURRENCY_VALUES, SupportedCurrencies } from '@keimelion/api/shared/enums/currency'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import { apiImageDetailSchema } from '@/data-access/_shared/image'
import { isSafeImageUrl } from '@/lib/is-safe-image-url'

const safeAvatarUrlSchema = z
  .string()
  .nullable()
  .transform((value): string | null => (isSafeImageUrl(value) ? value : null))

export const apiUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  authProvider: z.enum(AUTH_PROVIDER_VALUES),
  role: z.enum(USER_ROLE_VALUES),
  avatarUrl: safeAvatarUrlSchema,
  avatar: apiImageDetailSchema.nullable().optional(),
  isCgvAccepted: z.boolean(),
  cgvAcceptedAt: z.string().nullable(),
  isMarketingOptedIn: z.boolean(),
  defaultCurrency: z.enum(SUPPORTED_CURRENCY_VALUES).catch(SupportedCurrencies.EUR),
  emailVerifiedAt: z.string().nullable(),
  lastActiveAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ApiUser = z.infer<typeof apiUserSchema>
