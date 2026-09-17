'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { deleteOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

export function useDeleteOccasionType(): UseMutationResult<undefined, Error, string> {
  const queryClient = useQueryClient()

  return useMutation<undefined, Error, string>({
    mutationFn: async (id) => {
      await deleteOccasionType(id)
      return undefined
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['occasion-types'] })
      notifySuccess({ title: translate('occasion_types.mutation.deleted_toast') })
    },
  })
}
