'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import { FEEDBACK_QUERY_KEY, listAdminFeedback } from '@/data-access/feedback/feedback.api'
import type {
  ApiAdminFeedback,
  ListFeedbackQuery,
} from '@/data-access/feedback/feedback.schemas'

type FeedbackFilters = Partial<ListFeedbackQuery>

export function buildAdminFeedbackKey(
  filters: FeedbackFilters,
): readonly ['feedback', 'list', FeedbackFilters] {
  const normalized = normalizeFilters(filters)
  return [...FEEDBACK_QUERY_KEY, 'list', normalized] as const
}

interface UseAdminFeedbackOptions {
  enabled?: boolean
}

export function useAdminFeedback(
  filters: FeedbackFilters,
  options: UseAdminFeedbackOptions = {},
): UseQueryResult<PaginatedResponse<ApiAdminFeedback>> {
  return useQuery({
    queryKey: buildAdminFeedbackKey(filters),
    queryFn: () => listAdminFeedback(filters),
    enabled: options.enabled ?? true,
  })
}
