import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireSession } from '@/middlewares/require-session'

export function middleware(request: NextRequest): NextResponse {
  return requireSession(request) ?? NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
