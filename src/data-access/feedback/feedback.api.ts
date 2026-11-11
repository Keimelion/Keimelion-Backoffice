import type {
  AdminFeedbackDetailParsed,
  AdminFeedbackListResponseParsed,
  AdminFeedbackUpdateRequestInput,
} from '@keimelion/sdk/schemas'
import type { FeedbackStatus } from '@keimelion/sdk/enums'
import { apiClient } from '@/data-access/_shared/client'
import { emptyToUndefined, toDayEndIso, toDayStartIso } from '@/data-access/_shared/query-params'

export const FEEDBACK_QUERY_KEY = ['feedback'] as const

export interface ListAdminFeedbackParams {
  page?: number | undefined
  limit?: number | undefined
  title?: string | undefined
  userId?: string | undefined
  status?: FeedbackStatus | undefined
  createdFrom?: string | undefined
  createdTo?: string | undefined
  sort?: string | undefined
}

export async function listAdminFeedback(
  input: ListAdminFeedbackParams,
): Promise<AdminFeedbackListResponseParsed> {
  return apiClient.admin.feedback.list({
    page: input.page,
    limit: input.limit,
    sort: input.sort,
    'title[ilike]': emptyToUndefined(input.title),
    'userId[eq]': input.userId,
    'status[eq]': input.status,
    'createdAt[gte]': toDayStartIso(input.createdFrom),
    'createdAt[lte]': toDayEndIso(input.createdTo),
  })
}

export async function updateAdminFeedback(
  id: string,
  input: AdminFeedbackUpdateRequestInput,
): Promise<AdminFeedbackDetailParsed> {
  const { feedback } = await apiClient.admin.feedback.update(id, input)
  return feedback
}
