/**
 * Auth storage module.
 *
 * localStorage is acceptable for access tokens in this Backoffice only under the following
 * conditions: HTTPS in production, no dangerouslySetInnerHTML, no third-party scripts without
 * SRI, no user-generated HTML rendered in the Backoffice. Violating any of these conditions
 * requires migrating to httpOnly cookies.
 */

import { z } from 'zod'
import { AUTH_PROVIDER_VALUES } from '@keimelion/api/shared/enums/auth-provider'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import type { ApiUser } from '@/data-access/auth/auth.api'

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const STORED_USER_KEY = 'keimelion_user'

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

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser(): ApiUser | null {
  const raw = localStorage.getItem(STORED_USER_KEY)
  if (!raw) return null

  try {
    const parsed = apiUserSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      localStorage.removeItem(STORED_USER_KEY)
      return null
    }
    return parsed.data
  } catch {
    localStorage.removeItem(STORED_USER_KEY)
    return null
  }
}

export function setStoredUser(user: ApiUser): void {
  localStorage.setItem(STORED_USER_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORED_USER_KEY)
}
