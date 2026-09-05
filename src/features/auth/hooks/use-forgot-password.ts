'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { forgotPasswordApi } from '@/data-access/auth/auth.api'
import type { ForgotPasswordApiInput } from '@/data-access/auth/auth.api'

export function useForgotPassword(): UseMutationResult<null, Error, ForgotPasswordApiInput> {
  return useMutation<null, Error, ForgotPasswordApiInput>({
    mutationFn: async (input: ForgotPasswordApiInput) => {
      await forgotPasswordApi(input)
      return null
    },
  })
}
