import type { ModerationStatus } from '@keimelion/api/shared/enums/moderation-status'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import type { ApiItemSource } from './item-sources.schemas'
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
  const mockedResponse = { ...response, data: injectMockSourcesIntoList(response.data) }
  return parseApiResponse(adminItemListResponseSchema, mockedResponse, 'admin items')
}

export async function fetchItem(id: string): Promise<ApiAdminItem> {
  const response = await axiosInstance.get<unknown>(`/admin/items/${id}`)
  const parsed = parseApiResponse(adminItemMutationResponseSchema, response, 'admin item')
  return parsed.item
}

export async function createItem(input: CreateItemInput): Promise<ApiAdminItem> {
  const response = await axiosInstance.post<unknown>('/admin/items', input)
  const mockedResponse = {
    ...response,
    data: injectMockSourcesIntoMutation(response.data, input.sources.length),
  }
  const parsed = parseApiResponse(adminItemMutationResponseSchema, mockedResponse, 'admin item')
  return parsed.item
}

export async function updateItem(id: string, input: UpdateItemInput): Promise<ApiAdminItem> {
  const response = await axiosInstance.patch<unknown>(`/admin/items/${id}`, input)
  const mockedResponse = { ...response, data: injectMockSourcesIntoMutation(response.data) }
  const parsed = parseApiResponse(adminItemMutationResponseSchema, mockedResponse, 'admin item')
  return parsed.item
}

export async function softDeleteItem(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/items/${id}`)
}

export async function restoreItem(id: string): Promise<ApiAdminItem> {
  const response = await axiosInstance.post<unknown>(`/admin/items/${id}/restore`, {})
  const mockedResponse = { ...response, data: injectMockSourcesIntoMutation(response.data) }
  const parsed = parseApiResponse(adminItemMutationResponseSchema, mockedResponse, 'admin item')
  return parsed.item
}

// -----------------------------------------------------------------------------
// TODO(KEI-88): remove this block once the API embeds `sources` in every
// admin items response (list, create, update, restore). The detail endpoint
// GET /admin/items/{id} already returns sources, so injection there is a
// safety no-op (idempotent — mock only fires when sources is missing).
// -----------------------------------------------------------------------------

const MOCK_MAX_SOURCES = 5

function buildMockSources(itemId: string, count?: number): ApiItemSource[] {
  const finalCount = count ?? ((itemId.charCodeAt(0) % MOCK_MAX_SOURCES) + 1)
  const timestamp = '2026-01-01T00:00:00.000Z'
  return Array.from({ length: finalCount }, (_, index) => ({
    id: `mock-${itemId}-source-${index.toString()}`,
    itemId,
    shopId: null,
    sourceUrl: `https://example.com/${itemId}/source-${index.toString()}`,
    price: null,
    currency: 'EUR',
    isPrimary: index === 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}

function ensureSourcesOnItem(item: unknown, forcedCount?: number): unknown {
  if (typeof item !== 'object' || item === null || !('id' in item)) return item
  const record = item as Record<string, unknown>
  if (Array.isArray(record.sources)) return record
  const id = record.id
  if (typeof id !== 'string') return record
  return { ...record, sources: buildMockSources(id, forcedCount) }
}

function injectMockSourcesIntoList(rawData: unknown): unknown {
  if (typeof rawData !== 'object' || rawData === null) return rawData
  const record = rawData as Record<string, unknown>
  if (!Array.isArray(record.items)) return record
  return { ...record, items: record.items.map((item) => ensureSourcesOnItem(item)) }
}

function injectMockSourcesIntoMutation(rawData: unknown, forcedCount?: number): unknown {
  if (typeof rawData !== 'object' || rawData === null) return rawData
  const record = rawData as Record<string, unknown>
  if (!('item' in record)) return record
  return { ...record, item: ensureSourcesOnItem(record.item, forcedCount) }
}
