'use client'

import { useEffect, useState } from 'react'
import { getStoredUser } from '@/features/auth/auth-storage'
import { queryClient } from '@/lib/query-client'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/use-current-user'

interface AuthBootstrapProps {
  children: React.ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps): React.JSX.Element {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, storedUser)
    }
    setHydrated(true)
  }, [])

  if (!hydrated) return <></>

  return <>{children}</>
}
