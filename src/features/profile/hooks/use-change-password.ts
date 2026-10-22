'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { changeMyPassword } from '@/data-access/users/profile.api'
import type {
  ChangePasswordApiInput,
  ChangePasswordResponse,
} from '@/data-access/users/profile.schemas'
import { clearSession } from '@/data-access/_shared/auth-storage'
import { stopAutoRefresh } from '@/data-access/_shared/auth-storage/refresh-scheduler'
import { LOGIN_PASSWORD_CHANGED_URL } from '@/data-access/auth/notices'
import { queryClient } from '@/lib/query-client'

export function useChangePassword(): UseMutationResult<
  ChangePasswordResponse,
  Error,
  ChangePasswordApiInput
> {
  const router = useRouter()

  return useMutation<ChangePasswordResponse, Error, ChangePasswordApiInput>({
    meta: { silent: true, skipUnauthorizedRedirect: true },
    mutationFn: (input) => changeMyPassword(input),
    onSuccess: () => {
      stopAutoRefresh()
      clearSession()
      queryClient.clear()
      router.replace(LOGIN_PASSWORD_CHANGED_URL)
    },
  })
}
