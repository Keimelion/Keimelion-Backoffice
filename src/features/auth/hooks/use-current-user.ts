'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ApiUser } from '@/data-access/auth/auth.api'
import { getAccessToken, getStoredUser } from '@/lib/auth-storage'

export const CURRENT_USER_QUERY_KEY = ['currentUser'] as const

export function useCurrentUser(): UseQueryResult<ApiUser | null> {
  const storedUser = getStoredUser()

  return useQuery<ApiUser | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getStoredUser(),
    enabled: !!getAccessToken(),
    ...(storedUser !== null ? { initialData: storedUser } : {}),
  })
}
