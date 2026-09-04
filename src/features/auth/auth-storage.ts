/**
 * Auth storage module.
 *
 * localStorage is acceptable for access tokens in this Backoffice only under the following
 * conditions: HTTPS in production, no dangerouslySetInnerHTML, no third-party scripts without
 * SRI, no user-generated HTML rendered in the Backoffice. Violating any of these conditions
 * requires migrating to httpOnly cookies.
 */

import type { ApiUser } from '@/data-access/auth/auth.api'
import { apiUserSchema } from '@/features/auth/login-schema'

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const STORED_USER_KEY = 'keimelion_user'

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
