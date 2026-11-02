'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import {
  RESERVATIONS_QUERY_KEY,
  deleteAdminReservation,
} from '@/data-access/reservations/reservations.api'
import { ITEMS_QUERY_KEY } from '@/data-access/items/items.api'
import { ADMIN_USERS_QUERY_KEY } from '@/data-access/users/admin-users.api'

export function useDeleteAdminReservation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminReservation,
    meta: { silent: true },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY }),
      ])
    },
  })
}
