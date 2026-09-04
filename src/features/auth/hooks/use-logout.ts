'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { logoutApi } from '@/data-access/auth/auth.api'
import { clearAccessToken, clearStoredUser } from '@/features/auth/auth-storage'
import { queryClient } from '@/lib/query-client'

export function useLogout(): UseMutationResult<null, Error, null> {
  const router = useRouter()

  return useMutation<null, Error, null>({
    mutationFn: async () => {
      await logoutApi()
      return null
    },
    onSettled: () => {
      clearAccessToken()
      clearStoredUser()
      queryClient.clear()
      router.replace('/login')
    },
    onError: (error) => {
      console.warn('Logout API call failed, clearing session anyway:', error.message)
    },
  })
}
