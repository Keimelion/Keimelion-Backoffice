'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import type { FeedbackStatus } from '@keimelion/sdk/enums'
import { FEEDBACK_QUERY_KEY, updateAdminFeedback } from '@/data-access/feedback/feedback.api'
import type { AdminFeedbackDetailParsed } from '@keimelion/sdk/schemas'

export interface UpdateFeedbackStatusVariables {
  id: string
  status: FeedbackStatus
}

export function useUpdateFeedbackStatus(): UseMutationResult<
  AdminFeedbackDetailParsed,
  Error,
  UpdateFeedbackStatusVariables
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateAdminFeedback(id, { status }),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEY })
    },
  })
}
