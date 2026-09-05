import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireSession } from '@/middlewares/require-session'

/**
 * Edge middleware entry — Next.js hard-requires this exact filename and
 * location. Keep this file thin: it composes the individual middlewares in
 * `src/middlewares/` in order. Each helper returns a NextResponse to short-
 * circuit (redirect / rewrite / block) or null to hand off to the next.
 */
export function middleware(request: NextRequest): NextResponse {
  return requireSession(request) ?? NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
