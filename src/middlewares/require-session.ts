import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, isAllowedBackofficeRole } from '@/data-access/_auth-storage'

const LOGIN_PATH = '/login'
const DASHBOARD_HOME = '/'
const PUBLIC_PATHS = new Set<string>([LOGIN_PATH, '/forgot-password', '/reset-password'])

export function requireSession(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const hasValidSession = cookieValue !== undefined && isAllowedBackofficeRole(cookieValue)
  const isPublicPath = PUBLIC_PATHS.has(pathname)

  if (isPublicPath) {
    if (hasValidSession && pathname === LOGIN_PATH) {
      return NextResponse.redirect(new URL(DASHBOARD_HOME, request.url))
    }
    return null
  }

  if (!hasValidSession) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  return null
}
