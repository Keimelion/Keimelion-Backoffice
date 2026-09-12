'use client'

import { useAuthSession } from '@/features/auth/hooks/use-auth-session'

interface SessionGuardProps {
  children: React.ReactNode
}

export function SessionGuard({ children }: SessionGuardProps): React.JSX.Element {
  useAuthSession()
  return <>{children}</>
}
