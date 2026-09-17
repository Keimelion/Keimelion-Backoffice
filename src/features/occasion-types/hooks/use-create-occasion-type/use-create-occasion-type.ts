'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { createOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import type { AdminOccasionType, CreateOccasionTypeInput } from '@/data-access/occasion-types/admin-occasion-types.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

export function useCreateOccasionType(): UseMutationResult<AdminOccasionType, Error, CreateOccasionTypeInput> {
  const queryClient = useQueryClient()

  return useMutation<AdminOccasionType, Error, CreateOccasionTypeInput>({
    mutationFn: createOccasionType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['occasion-types'] })
      notifySuccess({ title: translate('occasion_types.mutation.created_toast') })
    },
  })
}
