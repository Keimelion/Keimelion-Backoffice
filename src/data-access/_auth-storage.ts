/**
 * Auth storage module.
 *
 * The access token is kept in localStorage — acceptable under these conditions:
 * HTTPS in production, no dangerouslySetInnerHTML, no third-party scripts
 * without SRI, no user-generated HTML rendered in the Backoffice. Violating any
 * of these requires migrating to httpOnly cookies.
 *
 * The `keimelion_session` cookie carries the user's role (e.g. "admin",
 * "moderator") so the Edge middleware can gate dashboard routes on role
 * before the page renders. The cookie is NOT httpOnly and NOT trusted for
 * security — the API remains the source of truth. It's a UX + defense-in-
 * depth signal.
 *
 * saveSession / clearSession are atomic: token, user, and cookie are always
 * written or cleared together to avoid drift.
 */

import { UserRoles } from '@keimelion/api/shared/enums/user-role'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import type { ApiUser } from '@/data-access/auth/auth.api'
import { apiUserSchema } from '@/data-access/_schemas/user'

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const STORED_USER_KEY = 'keimelion_user'
export const SESSION_COOKIE_NAME = 'keimelion_session'
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const ALLOWED_BACKOFFICE_ROLES: readonly UserRole[] = [UserRoles.ADMIN, UserRoles.MODERATOR]

/**
 * Single source of truth for "who can enter the Backoffice". Used by useLogin
 * (before persisting the session) and by the Edge middleware (on every
 * dashboard request). Edge-safe: pure comparison, no browser APIs.
 */
export function isAllowedBackofficeRole(role: string): boolean {
  return (ALLOWED_BACKOFFICE_ROLES as readonly string[]).includes(role)
}

function writeSessionCookie(role: string): void {
  document.cookie = `${SESSION_COOKIE_NAME}=${role}; path=/; max-age=${String(SESSION_COOKIE_MAX_AGE_SECONDS)}; samesite=lax`
}

function deleteSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
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

/**
 * Atomic session write. Called on successful login.
 */
export function saveSession(accessToken: string, user: ApiUser): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(STORED_USER_KEY, JSON.stringify(user))
  writeSessionCookie(user.role)
}

/**
 * Atomic session wipe. Called on logout, on 401, on tampered storage.
 */
export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(STORED_USER_KEY)
  deleteSessionCookie()
}

/**
 * Reconcile the session cookie with the stored user's role. Called once at
 * boot by AuthBootstrap so pre-existing sessions (created before the
 * middleware or the role-in-cookie shipped) get a correct cookie.
 */
export function syncSessionCookie(): void {
  const user = getStoredUser()
  if (user && isAllowedBackofficeRole(user.role)) {
    writeSessionCookie(user.role)
    return
  }
  deleteSessionCookie()
}
