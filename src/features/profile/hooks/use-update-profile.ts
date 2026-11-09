'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { updateMe } from '@/data-access/users/profile.api'
import { updateStoredUser } from '@/data-access/_shared/auth-storage'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/use-current-user'
import { useCurrencyStore } from '@/lib/i18n/currency-store'
import { queryClient } from '@/lib/query-client'
import type { UserDetailParsed, UsersUpdateProfileRequestInput } from '@keimelion/sdk/schemas'

interface UpdateProfileVariables {
  input: UsersUpdateProfileRequestInput
  avatar: File | null
}

export function useUpdateProfile(): UseMutationResult<UserDetailParsed, Error, UpdateProfileVariables> {
  return useMutation<UserDetailParsed, Error, UpdateProfileVariables>({
    meta: { silent: true },
    mutationFn: ({ input, avatar }) => updateMe(input, avatar),
    onSuccess: (user) => {
      updateStoredUser(user)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      useCurrencyStore.getState().setCurrency(user.defaultCurrency)
    },
  })
}
