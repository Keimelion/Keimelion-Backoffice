'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { loginApi } from '@/data-access/auth/auth.api'
import { isAllowedBackofficeRole, saveSession } from '@/data-access/_auth-storage'
import { loginResponseSchema } from '@/data-access/auth/auth.schemas'
import type { LoginInput } from '@/data-access/auth/auth.schemas'
import { queryClient } from '@/lib/query-client'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/use-current-user'

const UNAUTHORIZED_ROLE_MESSAGE =
  'This account is not authorized to access the Backoffice'

export function useLogin(): UseMutationResult<null, Error, LoginInput> {
  const router = useRouter()

  return useMutation<null, Error, LoginInput>({
    meta: { skipUnauthorizedRedirect: true },
    mutationFn: async (input: LoginInput) => {
      const raw = await loginApi(input)
      const parsed = loginResponseSchema.safeParse(raw)
      if (!parsed.success) {
        throw new Error('Unexpected response from the server')
      }

      const { accessToken, user } = parsed.data

      if (!isAllowedBackofficeRole(user.role)) {
        throw new Error(UNAUTHORIZED_ROLE_MESSAGE)
      }

      saveSession(accessToken, user)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      router.push('/')
      return null
    },
  })
}
