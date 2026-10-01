import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  itemSourceMutationResponseSchema,
  type ApiItemSource,
  type CreateItemSourceInput,
  type UpdateItemSourceInput,
} from './item-sources.schemas'

export async function createItemSource(
  itemId: string,
  input: CreateItemSourceInput,
): Promise<ApiItemSource> {
  const response = await axiosInstance.post<unknown>(
    `/admin/items/${itemId}/sources`,
    input,
  )
  const parsed = parseApiResponse(itemSourceMutationResponseSchema, response, 'item source')
  return parsed.source
}

export async function updateItemSource(
  itemId: string,
  sourceId: string,
  input: UpdateItemSourceInput,
): Promise<ApiItemSource> {
  const response = await axiosInstance.patch<unknown>(
    `/admin/items/${itemId}/sources/${sourceId}`,
    input,
  )
  const parsed = parseApiResponse(itemSourceMutationResponseSchema, response, 'item source')
  return parsed.source
}

export async function deleteItemSource(itemId: string, sourceId: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/items/${itemId}/sources/${sourceId}`)
}
