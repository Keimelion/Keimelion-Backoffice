'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { ADMIN_USERS_QUERY_KEY, createAdminUser } from '@/data-access/users/admin-users.api'
import type { AdminUserMutationUser } from '@/data-access/users/admin-users.schemas'
import type { CreateAdminUserInput } from '@/data-access/users/admin-users.schemas'

export function useCreateUser(): UseMutationResult<AdminUserMutationUser, Error, CreateAdminUserInput> {
  const queryClient = useQueryClient()

  return useMutation<AdminUserMutationUser, Error, CreateAdminUserInput>({
    mutationFn: createAdminUser,
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}
