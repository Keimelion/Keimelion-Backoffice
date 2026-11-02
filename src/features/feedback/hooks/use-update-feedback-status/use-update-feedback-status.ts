'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import type { FeedbackStatus } from '@keimelion/api/shared/enums/feedback-status'
import { FEEDBACK_QUERY_KEY, updateAdminFeedback } from '@/data-access/feedback/feedback.api'
import type { ApiAdminFeedback } from '@/data-access/feedback/feedback.schemas'

export interface UpdateFeedbackStatusVariables {
  id: string
  status: FeedbackStatus
}

export function useUpdateFeedbackStatus(): UseMutationResult<
  ApiAdminFeedback,
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
