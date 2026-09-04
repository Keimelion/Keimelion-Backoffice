'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { logoutApi } from '@/data-access/auth/auth.api'
import { clearAccessToken, clearStoredUser } from '@/data-access/_auth-storage'
import { queryClient } from '@/lib/query-client'

export function useLogout(): UseMutationResult<null, Error, null> {
  const router = useRouter()

  return useMutation<null, Error, null>({
    mutationFn: async () => {
      await logoutApi()
      return null
    },
    meta: { silent: true },
    onSettled: () => {
      clearAccessToken()
      clearStoredUser()
      queryClient.clear()
      router.replace('/login')
    },
  })
}
