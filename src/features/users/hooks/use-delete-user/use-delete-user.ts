'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { ADMIN_USERS_QUERY_KEY, deleteAdminUser } from '@/data-access/users/admin-users.api'

type DeleteResult = undefined

export function useDeleteUser(): UseMutationResult<DeleteResult, Error, string> {
  const queryClient = useQueryClient()

  return useMutation<DeleteResult, Error, string>({
    mutationFn: async (id) => {
      await deleteAdminUser(id)
      return undefined
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}
