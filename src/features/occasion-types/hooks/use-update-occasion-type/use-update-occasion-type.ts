'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { updateOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import type { AdminOccasionType, UpdateOccasionTypeInput } from '@/data-access/occasion-types/admin-occasion-types.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

interface UpdateOccasionTypeVariables {
  id: string
  input: UpdateOccasionTypeInput
}

export function useUpdateOccasionType(): UseMutationResult<AdminOccasionType, Error, UpdateOccasionTypeVariables> {
  const queryClient = useQueryClient()

  return useMutation<AdminOccasionType, Error, UpdateOccasionTypeVariables>({
    mutationFn: ({ id, input }) => updateOccasionType(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['occasion-types'] })
      notifySuccess({ title: translate('occasion_types.mutation.updated_toast') })
    },
  })
}
