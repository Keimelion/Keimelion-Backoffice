'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { logout } from '@/data-access/auth/logout'
import { clearSession } from '@/data-access/_shared/auth-storage'
import { stopAutoRefresh } from '@/data-access/_shared/auth-storage/refresh-scheduler'
import { queryClient } from '@/lib/query-client'

export function useLogout(): UseMutationResult<null, Error, null> {
  const router = useRouter()

  return useMutation<null, Error, null>({
    mutationFn: async () => {
      await logout()
      return null
    },
    meta: { silent: true },
    onSettled: () => {
      stopAutoRefresh()
      clearSession()
      queryClient.clear()
      router.replace('/login')
    },
  })
}
