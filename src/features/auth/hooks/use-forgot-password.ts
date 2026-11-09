'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { forgotPassword } from '@/data-access/auth/forgot-password'
import type { ForgotPasswordInput } from '@/features/auth/auth.input-schemas'
import { LOGIN_FORGOT_REQUESTED_URL } from '@/data-access/auth/notices'

export function useForgotPassword(): UseMutationResult<null, Error, ForgotPasswordInput> {
  const router = useRouter()

  return useMutation<null, Error, ForgotPasswordInput>({
    mutationFn: async (input: ForgotPasswordInput) => {
      await forgotPassword(input)
      return null
    },
    onSuccess: () => {
      router.replace(LOGIN_FORGOT_REQUESTED_URL)
    },
  })
}
