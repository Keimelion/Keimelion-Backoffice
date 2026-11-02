import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminListItemsListResponseSchema,
  adminListListResponseSchema,
  adminListMutationResponseSchema,
  type ApiAdminList,
  type ApiAdminListItem,
  type ListItemsPaginationQuery,
  type ListListsQuery,
  type UpdateListInput,
} from './lists.schemas'

export const LISTS_QUERY_KEY = ['lists'] as const

function buildListParams(input: Partial<ListListsQuery>): Record<string, string> {
  const params: Record<string, string> = {}
  if (input.page !== undefined) params.page = String(input.page)
  if (input.limit !== undefined) params.limit = String(input.limit)
  if (input.id !== undefined) params['id[eq]'] = input.id
  if (typeof input.search === 'string' && input.search.length > 0) {
    params['title[ilike]'] = input.search
  }
  if (input.listStatus !== undefined) {
    params['listStatus[eq]'] = input.listStatus
  }
  if (input.occasionTypeId !== undefined) {
    params['occasionTypeId[eq]'] = input.occasionTypeId
  }
  if (input.ownerUserId !== undefined) {
    params.ownerUserId = input.ownerUserId
  }
  if (input.sort !== undefined) params.sort = input.sort
  return params
}

function buildListItemsParams(input: ListItemsPaginationQuery): Record<string, string> {
  return {
    page: String(input.page),
    limit: String(input.limit),
  }
}

export async function listAdminLists(
  input: Partial<ListListsQuery>,
): Promise<PaginatedResponse<ApiAdminList>> {
  const response = await axiosInstance.get<unknown>('/admin/lists', {
    params: buildListParams(input),
  })
  return parseApiResponse(adminListListResponseSchema, response, 'admin lists')
}

export async function fetchAdminList(id: string): Promise<ApiAdminList> {
  const response = await axiosInstance.get<unknown>(`/admin/lists/${id}`)
  const parsed = parseApiResponse(adminListMutationResponseSchema, response, 'admin list')
  return parsed.list
}

export async function updateList(id: string, input: UpdateListInput): Promise<ApiAdminList> {
  const response = await axiosInstance.patch<unknown>(`/admin/lists/${id}`, input)
  const parsed = parseApiResponse(adminListMutationResponseSchema, response, 'admin list')
  return parsed.list
}

export async function deleteList(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/lists/${id}`)
}

export async function restoreList(id: string): Promise<ApiAdminList> {
  const response = await axiosInstance.post<unknown>(`/admin/lists/${id}/restore`)
  const parsed = parseApiResponse(adminListMutationResponseSchema, response, 'admin list')
  return parsed.list
}

export async function listAdminListItems(
  listId: string,
  pagination: ListItemsPaginationQuery,
): Promise<PaginatedResponse<ApiAdminListItem>> {
  const response = await axiosInstance.get<unknown>(`/admin/lists/${listId}/items`, {
    params: buildListItemsParams(pagination),
  })
  return parseApiResponse(adminListItemsListResponseSchema, response, 'admin list items')
}
