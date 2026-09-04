import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/data-access/_auth-storage'

const LOGIN_PATH = '/login'
const DASHBOARD_HOME = '/'

/**
 * Edge middleware — first line of defense on route access.
 *
 * Reads a non-sensitive session flag cookie (written client-side by
 * auth-storage when the user logs in) to gate routes before the page renders:
 *   - visiting /login while logged in → redirect to /
 *   - visiting any protected route without the cookie → redirect to /login
 *
 * This is a UX + defense-in-depth layer only. The real access control is
 * enforced by the API on every request. The client-side RequireAuth guard
 * remains in place to handle role checks and edge cases (corrupt storage,
 * mid-session role change) that the middleware cannot see.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)

  if (pathname.startsWith(LOGIN_PATH)) {
    if (hasSession) {
      return NextResponse.redirect(new URL(DASHBOARD_HOME, request.url))
    }
    return NextResponse.next()
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
