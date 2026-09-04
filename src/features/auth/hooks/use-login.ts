'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { UserRoles } from '@keimelion/api/shared/enums/user-role'
import { loginApi } from '@/data-access/auth/auth.api'
import { setAccessToken, setStoredUser } from '@/features/auth/auth-storage'
import { loginResponseSchema } from '@/features/auth/login-schema'
import type { LoginInput } from '@/features/auth/login-schema'
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

      if (user.role === UserRoles.USER) {
        throw new Error(UNAUTHORIZED_ROLE_MESSAGE)
      }

      setAccessToken(accessToken)
      setStoredUser(user)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      router.push('/')
      return null
    },
  })
}
