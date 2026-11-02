'use client'

import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { updateMe } from '@/data-access/users/profile.api'
import type { UpdateProfileInput } from '@/data-access/users/profile.schemas'
import { updateStoredUser } from '@/data-access/_shared/auth-storage'
import type { ApiUser } from '@/data-access/_shared/user'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/use-current-user'
import { useCurrencyStore } from '@/lib/i18n/currency-store'
import { queryClient } from '@/lib/query-client'

export function useUpdateProfile(): UseMutationResult<ApiUser, Error, UpdateProfileInput> {
  return useMutation<ApiUser, Error, UpdateProfileInput>({
    meta: { silent: true },
    mutationFn: (input) => updateMe(input),
    onSuccess: (user) => {
      updateStoredUser(user)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      useCurrencyStore.getState().setCurrency(user.defaultCurrency)
    },
  })
}
