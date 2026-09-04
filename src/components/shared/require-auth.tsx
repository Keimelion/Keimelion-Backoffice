'use client'

/**
 * Client-side guard — second layer of defense.
 *
 * Real access control is enforced by the API on every request. The Edge
 * middleware (src/middleware.ts) is the first layer and blocks page renders
 * for anyone without a session cookie. This component handles what the
 * middleware cannot see: role checks (rejects `role === user` because the
 * middleware only sees a boolean session flag) and edge cases like corrupt
 * localStorage.
 *
 * Do not rely on this for security.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserRoles } from '@keimelion/api/shared/enums/user-role'
import { getAccessToken } from '@/data-access/_auth-storage'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps): React.JSX.Element {
  const router = useRouter()
  const currentUser = useCurrentUser()

  const hasToken = !!getAccessToken()
  const isUnauthorized =
    !hasToken || currentUser === null || currentUser.role === UserRoles.USER

  useEffect(() => {
    if (isUnauthorized) {
      router.replace('/login')
    }
  }, [isUnauthorized, router])

  if (isUnauthorized) return <></>

  return <>{children}</>
}
