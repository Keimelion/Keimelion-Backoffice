'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { getMe } from '@/data-access/users/profile.api'
import { getStoredUser, updateStoredUser } from '@/data-access/_shared/auth-storage'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/use-current-user'
import { queryClient } from '@/lib/query-client'
import type { UserDetailParsed } from '@keimelion/sdk/schemas'

export function useProfile(): UseQueryResult<UserDetailParsed> {
  const query = useQuery<UserDetailParsed>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getMe(),
    initialData: () => getStoredUser() ?? undefined,
  })

  useEffect(() => {
    if (query.data) {
      updateStoredUser(query.data)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, query.data)
    }
  }, [query.data])

  return query
}
