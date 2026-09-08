'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { forgotPasswordApi } from '@/data-access/auth/auth.api'
import type { ForgotPasswordApiInput } from '@/data-access/auth/auth.api'
import { LOGIN_FORGOT_REQUESTED_URL } from '@/data-access/auth/auth.constants'

export function useForgotPassword(): UseMutationResult<null, Error, ForgotPasswordApiInput> {
  const router = useRouter()

  return useMutation<null, Error, ForgotPasswordApiInput>({
    mutationFn: async (input: ForgotPasswordApiInput) => {
      await forgotPasswordApi(input)
      return null
    },
    onSuccess: () => {
      router.replace(LOGIN_FORGOT_REQUESTED_URL)
    },
  })
}
