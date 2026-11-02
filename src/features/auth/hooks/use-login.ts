'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { login, type LoginInput } from '@/data-access/auth/login'
import { isAllowedBackofficeRole, saveSession } from '@/data-access/_shared/auth-storage'
import { queryClient } from '@/lib/query-client'
import { translate } from '@/lib/i18n/translate'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/use-current-user'
import { notifySuccess } from '@/lib/notify'

export function useLogin(): UseMutationResult<null, Error, LoginInput> {
  const router = useRouter()

  return useMutation<null, Error, LoginInput>({
    meta: { skipUnauthorizedRedirect: true },
    mutationFn: async (input: LoginInput) => {
      const { accessToken, refreshToken, user } = await login(input)

      if (!isAllowedBackofficeRole(user.role)) {
        throw new Error(translate('auth.login.unauthorized_role'))
      }

      saveSession(accessToken, refreshToken, user)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      const greetingName = user.username ?? user.email
      notifySuccess({ title: translate('auth.login.welcome_back', { name: greetingName }) })
      router.push('/')
      return null
    },
  })
}
