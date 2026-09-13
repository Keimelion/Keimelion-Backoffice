'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  resetPassword,
  RESET_PASSWORD_INVALID_TOKEN_CODE,
  type ResetPasswordApiInput,
} from '@/data-access/auth/reset-password'
import { clearSession } from '@/data-access/_shared/auth-storage'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  FORGOT_PASSWORD_EXPIRED_LINK_URL,
  LOGIN_RESET_SUCCESS_URL,
} from '@/data-access/auth/notices'
import { queryClient } from '@/lib/query-client'
import { notifyError } from '@/lib/notify'

export function useResetPassword(): UseMutationResult<null, Error, ResetPasswordApiInput> {
  const router = useRouter()

  return useMutation<null, Error, ResetPasswordApiInput>({
    meta: { silent: true },
    mutationFn: async (input: ResetPasswordApiInput) => {
      await resetPassword(input)
      return null
    },
    onSuccess: () => {
      clearSession()
      queryClient.clear()
      router.replace(LOGIN_RESET_SUCCESS_URL)
    },
    onError: (error) => {
      const isInvalidToken =
        error instanceof ApiRequestError &&
        error.code === RESET_PASSWORD_INVALID_TOKEN_CODE
      if (isInvalidToken) {
        router.replace(FORGOT_PASSWORD_EXPIRED_LINK_URL)
        return
      }
      notifyError(error)
    },
  })
}
