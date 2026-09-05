/**
 * Auth storage module.
 *
 * The access token is kept in localStorage — acceptable under these conditions:
 * HTTPS in production, no dangerouslySetInnerHTML, no third-party scripts
 * without SRI, no user-generated HTML rendered in the Backoffice. Violating any
 * of these requires migrating to httpOnly cookies.
 *
 * A non-sensitive `keimelion_session` cookie mirrors the presence of the token
 * (value: "1") so the Edge middleware can gate dashboard routes before the
 * page renders. The cookie does NOT contain the token itself — only a flag.
 * It is written / cleared alongside the token so localStorage and cookie
 * stay in sync.
 */

import type { ApiUser } from '@/data-access/auth/auth.api'
import { apiUserSchema } from '@/data-access/_schemas/user'

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const STORED_USER_KEY = 'keimelion_user'
export const SESSION_COOKIE_NAME = 'keimelion_session'
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function setSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=${String(SESSION_COOKIE_MAX_AGE_SECONDS)}; samesite=lax`
}

function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  setSessionCookie()
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  clearSessionCookie()
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

/**
 * Reconcile the session cookie with the localStorage token. Called once at
 * boot by AuthBootstrap so pre-existing sessions (created before the middleware
 * shipped) get a cookie, and stale cookies without a token get cleared.
 */
export function syncSessionCookie(): void {
  if (getAccessToken()) {
    setSessionCookie()
    return
  }
  clearSessionCookie()
}
