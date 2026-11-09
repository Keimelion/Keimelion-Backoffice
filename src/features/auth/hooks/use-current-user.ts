'use client'

import { useQuery } from '@tanstack/react-query'
import type { UserDetailParsed } from '@keimelion/sdk/schemas'

export const CURRENT_USER_QUERY_KEY = ['currentUser'] as const

export function useCurrentUser(): UserDetailParsed | null {
  const { data } = useQuery<UserDetailParsed | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => Promise.resolve(null),
    enabled: false,
    initialData: null,
  })
  return data
}
