import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, isAllowedBackofficeRole } from '@/data-access/_auth-storage'

const LOGIN_PATH = '/login'
const DASHBOARD_HOME = '/'

/**
 * Route-access gate based on the session cookie set by auth-storage on login.
 * The cookie value is the user's role (e.g. "admin", "moderator"); the same
 * isAllowedBackofficeRole helper used by useLogin validates it here so the
 * "who can enter the Backoffice" rule lives in exactly one place.
 *
 * Two rules:
 *   - visiting /login with a valid role → redirect to /
 *   - visiting any protected route without a valid role → redirect to /login
 *
 * Returns a NextResponse when it decides to redirect, or null when the
 * request should continue through the remaining middlewares.
 *
 * This is a UX + defense-in-depth layer only. Real access control is enforced
 * by the API on every request — the cookie is client-writable and cannot be
 * trusted for security.
 */
export function requireSession(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const hasValidSession = cookieValue !== undefined && isAllowedBackofficeRole(cookieValue)

  if (pathname.startsWith(LOGIN_PATH)) {
    if (hasValidSession) {
      return NextResponse.redirect(new URL(DASHBOARD_HOME, request.url))
    }
    return null
  }

  if (!hasValidSession) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  return null
}
