import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminFeedbackListResponseSchema,
  adminFeedbackMutationResponseSchema,
  type ApiAdminFeedback,
  type ListFeedbackQuery,
  type UpdateFeedbackInput,
} from './feedback.schemas'

export const FEEDBACK_QUERY_KEY = ['feedback'] as const

const DAY_START_SUFFIX = 'T00:00:00.000Z'
const DAY_END_SUFFIX = 'T23:59:59.999Z'

function buildListParams(input: Partial<ListFeedbackQuery>): Record<string, string> {
  const params: Record<string, string> = {}
  if (input.page !== undefined) params.page = String(input.page)
  if (input.limit !== undefined) params.limit = String(input.limit)
  if (typeof input.title === 'string' && input.title.length > 0) {
    params['title[ilike]'] = input.title
  }
  if (input.userId !== undefined) {
    params['userId[eq]'] = input.userId
  }
  if (input.status !== undefined) {
    params['status[eq]'] = input.status
  }
  if (input.createdFrom !== undefined) {
    params['createdAt[gte]'] = `${input.createdFrom}${DAY_START_SUFFIX}`
  }
  if (input.createdTo !== undefined) {
    params['createdAt[lte]'] = `${input.createdTo}${DAY_END_SUFFIX}`
  }
  if (input.sort !== undefined) params.sort = input.sort
  return params
}

export async function listAdminFeedback(
  input: Partial<ListFeedbackQuery>,
): Promise<PaginatedResponse<ApiAdminFeedback>> {
  const response = await axiosInstance.get<unknown>('/admin/feedback', {
    params: buildListParams(input),
  })
  return parseApiResponse(adminFeedbackListResponseSchema, response, 'admin feedback')
}

export async function updateAdminFeedback(
  id: string,
  input: UpdateFeedbackInput,
): Promise<ApiAdminFeedback> {
  const response = await axiosInstance.patch<unknown>(`/admin/feedback/${id}`, input)
  const parsed = parseApiResponse(adminFeedbackMutationResponseSchema, response, 'admin feedback')
  return parsed.feedback
}
