import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminItemListResponseSchema,
  adminItemMutationResponseSchema,
  type ApiAdminItem,
  type CreateItemInput,
  type ListItemsQuery,
  type UpdateItemInput,
} from './items.schemas'

export const ITEMS_QUERY_KEY = ['items'] as const

function buildListParams(input: Partial<ListItemsQuery>): Record<string, string> {
  const params: Record<string, string> = {}
  if (input.page !== undefined) params.page = String(input.page)
  if (input.limit !== undefined) params.limit = String(input.limit)
  if (typeof input.search === 'string' && input.search.length > 0) {
    params['name[ilike]'] = input.search
  }
  if (input.sort !== undefined) params.sort = input.sort
  return params
}

export async function listAdminItems(
  input: Partial<ListItemsQuery>,
): Promise<PaginatedResponse<ApiAdminItem>> {
  const response = await axiosInstance.get<unknown>('/admin/items', {
    params: buildListParams(input),
  })
  return parseApiResponse(adminItemListResponseSchema, response, 'admin items')
}

export async function fetchAdminItem(id: string): Promise<ApiAdminItem> {
  const response = await axiosInstance.get<unknown>(`/admin/items/${id}`)
  const parsed = parseApiResponse(adminItemMutationResponseSchema, response, 'admin item')
  return parsed.item
}

export async function createItem(input: CreateItemInput): Promise<ApiAdminItem> {
  const response = await axiosInstance.post<unknown>('/admin/items', input)
  const parsed = parseApiResponse(adminItemMutationResponseSchema, response, 'admin item')
  return parsed.item
}

export async function updateItem(id: string, input: UpdateItemInput): Promise<ApiAdminItem> {
  const response = await axiosInstance.patch<unknown>(`/admin/items/${id}`, input)
  const parsed = parseApiResponse(adminItemMutationResponseSchema, response, 'admin item')
  return parsed.item
}

export async function deleteItem(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/items/${id}`)
}
