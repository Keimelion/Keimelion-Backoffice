import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminTagListResponseSchema,
  adminTagMutationResponseSchema,
  type ApiTag,
  type CreateTagInput,
  type ListTagsQuery,
  type UpdateTagInput,
} from './tags.schemas'

export const TAGS_QUERY_KEY = ['tags'] as const

const DEFAULT_SORT = 'createdAt:desc'

function buildListParams(input: Partial<ListTagsQuery>): Record<string, string> {
  const params: Record<string, string> = { sort: DEFAULT_SORT }
  if (input.page !== undefined) params.page = String(input.page)
  if (input.limit !== undefined) params.limit = String(input.limit)
  if (typeof input.search === 'string' && input.search.length > 0) {
    params['name[ilike]'] = input.search
  }
  return params
}

export async function listAdminTags(
  input: Partial<ListTagsQuery>,
): Promise<PaginatedResponse<ApiTag>> {
  const response = await axiosInstance.get<unknown>('/admin/tags', {
    params: buildListParams(input),
  })
  return parseApiResponse(adminTagListResponseSchema, response, 'admin tags')
}

export async function fetchAdminTag(id: string): Promise<ApiTag> {
  const response = await axiosInstance.get<unknown>(`/admin/tags/${id}`)
  const parsed = parseApiResponse(adminTagMutationResponseSchema, response, 'admin tag')
  return parsed.tag
}

export async function createTag(input: CreateTagInput): Promise<ApiTag> {
  const response = await axiosInstance.post<unknown>('/admin/tags', input)
  const parsed = parseApiResponse(adminTagMutationResponseSchema, response, 'admin tag')
  return parsed.tag
}

export async function updateTag(id: string, input: UpdateTagInput): Promise<ApiTag> {
  const response = await axiosInstance.patch<unknown>(`/admin/tags/${id}`, input)
  const parsed = parseApiResponse(adminTagMutationResponseSchema, response, 'admin tag')
  return parsed.tag
}

export async function deleteTag(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/tags/${id}`)
}
