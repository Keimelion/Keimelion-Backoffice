'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { resetPasswordApi } from '@/data-access/auth/auth.api'
import type { ResetPasswordApiInput } from '@/data-access/auth/auth.api'

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
      router.replace(RESET_SUCCESS_REDIRECT)
    },
  })
}
