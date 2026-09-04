'use client'

/**
 * Client-side defense-in-depth only — real access control is enforced by the API.
 * Do not rely on this for security. This guard prevents navigating to dashboard routes
 * when no valid token or insufficient role is detected client-side.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserRoles } from '@keimelion/api/shared/enums/user-role'
import { getAccessToken } from '@/lib/auth-storage'
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
