'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiUser } from '@/data-access/auth/auth.api'

export const CURRENT_USER_QUERY_KEY = ['currentUser'] as const

export function useCurrentUser(): ApiUser | null {
  const { data } = useQuery<ApiUser | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    enabled: false,
    initialData: null,
  })
  return data
}
