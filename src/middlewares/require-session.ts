import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/data-access/_auth-storage'

const LOGIN_PATH = '/login'
const DASHBOARD_HOME = '/'

/**
 * Route-access gate based on the non-sensitive session cookie written by
 * auth-storage on login. Two rules:
 *   - visiting /login while logged in → redirect to /
 *   - visiting any protected route without the cookie → redirect to /login
 *
 * Returns a NextResponse when it decides to redirect, or null when the
 * request should continue through the remaining middlewares.
 *
 * This is a UX + defense-in-depth layer only. Real access control is enforced
 * by the API on every request. The client-side RequireAuth guard covers role
 * checks and edge cases the middleware cannot see.
 */
export function requireSession(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)

  if (pathname.startsWith(LOGIN_PATH)) {
    if (hasSession) {
      return NextResponse.redirect(new URL(DASHBOARD_HOME, request.url))
    }
    return null
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  return null
}
