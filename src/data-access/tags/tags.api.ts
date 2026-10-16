import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminTagListResponseSchema,
  type ApiTag,
} from './tags.schemas'

export const TAGS_QUERY_KEY = ['tags'] as const

const DEFAULT_LIMIT = 100
const DEFAULT_PAGE = 1

export async function listAdminTags(): Promise<ApiTag[]> {
  const response = await axiosInstance.get<unknown>('/admin/tags', {
    params: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
  })
  const parsed = parseApiResponse(adminTagListResponseSchema, response, 'admin tags')
  return parsed.items
}
