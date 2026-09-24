import type { ModerationStatus } from '@keimelion/api/shared/enums/moderation-status'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminItemListResponseSchema,
  adminItemMutationResponseSchema,
  type ApiAdminItem,
  type CreateItemInput,
  type UpdateItemInput,
} from './items.schemas'

export const ITEMS_QUERY_KEY = ['items'] as const

const DELETED_AT_IS_NULL_FALSE = 'false'

export interface ListItemsParams {
  page?: number | undefined
  limit?: number | undefined
  sort?: string | undefined
  name?: string | undefined
  moderationStatus?: ModerationStatus | undefined
  includeDeleted?: boolean | undefined
}

export function buildListItemsParams(params: ListItemsParams): Record<string, unknown> {
  const query: Record<string, unknown> = {}
  if (params.page !== undefined) query.page = params.page
  if (params.limit !== undefined) query.limit = params.limit
  if (params.sort !== undefined) query.sort = params.sort
  if (params.name !== undefined && params.name.length > 0) {
    query['name[ilike]'] = params.name
  }
  if (params.moderationStatus !== undefined) {
    query['moderationStatus[eq]'] = params.moderationStatus
  }
  if (params.includeDeleted === true) {
    query['deletedAt[isNull]'] = DELETED_AT_IS_NULL_FALSE
  }
  return query
}

export async function fetchItems(params: ListItemsParams): Promise<PaginatedResponse<ApiAdminItem>> {
  const response = await axiosInstance.get<unknown>('/admin/items', {
    params: buildListItemsParams(params),
  })
  return parseApiResponse(adminItemListResponseSchema, response, 'admin items')
}

export async function fetchItem(id: string): Promise<ApiAdminItem> {
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

export async function softDeleteItem(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/items/${id}`)
}

export async function restoreItem(id: string): Promise<ApiAdminItem> {
  const response = await axiosInstance.post<unknown>(`/admin/items/${id}/restore`, {})
  const parsed = parseApiResponse(adminItemMutationResponseSchema, response, 'admin item')
  return parsed.item
}
