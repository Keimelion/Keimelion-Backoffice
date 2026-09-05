'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { resetPasswordApi } from '@/data-access/auth/auth.api'
import type { ResetPasswordApiInput } from '@/data-access/auth/auth.api'
import { clearSession } from '@/data-access/_auth-storage'
import { queryClient } from '@/lib/query-client'

const RESET_SUCCESS_REDIRECT = '/login?reset=success'

export function useResetPassword(): UseMutationResult<null, Error, ResetPasswordApiInput> {
  const router = useRouter()

  return useMutation<null, Error, ResetPasswordApiInput>({
    meta: { silent: true },
    mutationFn: async (input: ResetPasswordApiInput) => {
      await resetPasswordApi(input)
      return null
    },
    onSuccess: () => {
      // The API revokes all sessions on successful reset. Wipe any local
      // session state so a currently logged-in user who resets their own
      // password isn't caught with a dead token (which would trigger a
      // /login -> / -> 401 -> /login redirect loop via the middleware) and
      // is guaranteed to land on the /login banner with a clean cache.
      clearSession()
      queryClient.clear()
      router.replace(RESET_SUCCESS_REDIRECT)
    },
  })
}
