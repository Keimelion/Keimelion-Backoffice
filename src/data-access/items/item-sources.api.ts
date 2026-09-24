import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  itemSourceListResponseSchema,
  itemSourceMutationResponseSchema,
  type ApiItemSource,
  type CreateItemSourceInput,
  type UpdateItemSourceInput,
} from './item-sources.schemas'

export const ITEM_SOURCES_QUERY_KEY = ['items', 'sources'] as const

export async function fetchItemSources(itemId: string): Promise<ApiItemSource[]> {
  const response = await axiosInstance.get<unknown>(`/admin/items/${itemId}/sources`)
  const parsed = parseApiResponse(itemSourceListResponseSchema, response, 'item sources')
  return parsed.sources
}

export async function createItemSource(
  itemId: string,
  input: CreateItemSourceInput,
): Promise<ApiItemSource> {
  const response = await axiosInstance.post<unknown>(`/admin/items/${itemId}/sources`, input)
  const parsed = parseApiResponse(itemSourceMutationResponseSchema, response, 'item source')
  return parsed.source
}

export async function updateItemSource(
  itemId: string,
  sourceId: string,
  input: UpdateItemSourceInput,
): Promise<ApiItemSource> {
  const response = await axiosInstance.patch<unknown>(`/admin/items/${itemId}/sources/${sourceId}`, input)
  const parsed = parseApiResponse(itemSourceMutationResponseSchema, response, 'item source')
  return parsed.source
}

export async function deleteItemSource(itemId: string, sourceId: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/items/${itemId}/sources/${sourceId}`)
}
