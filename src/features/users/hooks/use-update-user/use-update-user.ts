'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { ADMIN_USERS_QUERY_KEY, updateAdminUser } from '@/data-access/users/admin-users.api'
import type { AdminUserMutationUser, UpdateAdminUserInput } from '@/data-access/users/admin-users.schemas'

interface UpdateUserVariables {
  id: string
  input: UpdateAdminUserInput
}

export function useUpdateUser(): UseMutationResult<AdminUserMutationUser, Error, UpdateUserVariables> {
  const queryClient = useQueryClient()

  return useMutation<AdminUserMutationUser, Error, UpdateUserVariables>({
    mutationFn: ({ id, input }) => updateAdminUser(id, input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}
