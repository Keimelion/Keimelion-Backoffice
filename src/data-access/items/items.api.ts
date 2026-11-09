import type {
  AdminItemDetailParsed,
  AdminItemsCreateRequestInput,
  AdminItemsListResponseParsed,
  AdminItemsUpdateRequestInput,
  ItemWithSourcesDetailParsed,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'
import { emptyToUndefined } from '@/data-access/_shared/query-params'

export const ITEMS_QUERY_KEY = ['items'] as const

const IMAGE_FIELD = 'image'

export interface ListAdminItemsParams {
  page?: number | undefined
  limit?: number | undefined
  id?: string | undefined
  search?: string | undefined
  sort?: string | undefined
}

export async function listAdminItems(
  input: ListAdminItemsParams,
): Promise<AdminItemsListResponseParsed> {
  return apiClient.admin.items.list({
    page: input.page,
    limit: input.limit,
    sort: input.sort,
    'id[eq]': input.id,
    'name[ilike]': emptyToUndefined(input.search),
  })
}

export async function fetchAdminItem(id: string): Promise<AdminItemDetailParsed> {
  const { item } = await apiClient.admin.items.get(id)
  return item
}

export async function createItem(
  input: AdminItemsCreateRequestInput,
  image: File | null,
): Promise<ItemWithSourcesDetailParsed> {
  const body = image === null ? input : buildCreateItemFormData(input, image)
  const { item } = await apiClient.admin.items.create(body)
  return item
}

export async function updateItem(
  id: string,
  input: AdminItemsUpdateRequestInput,
  image: File | null,
): Promise<ItemWithSourcesDetailParsed> {
  const body = image === null ? input : buildUpdateItemFormData(input, image)
  const { item } = await apiClient.admin.items.update(id, body)
  return item
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.admin.items.delete(id)
}

function buildCreateItemFormData(input: AdminItemsCreateRequestInput, image: File): FormData {
  const formData = new FormData()
  formData.set('name', input.name)
  formData.set('sources', JSON.stringify(input.sources))
  if (typeof input.description === 'string') formData.set('description', input.description)
  if (input.categories !== undefined) formData.set('categories', JSON.stringify(input.categories))
  if (input.tags !== undefined) formData.set('tags', JSON.stringify(input.tags))
  formData.set(IMAGE_FIELD, image)
  return formData
}

function buildUpdateItemFormData(input: AdminItemsUpdateRequestInput, image: File): FormData {
  const formData = new FormData()
  if (input.name !== undefined) formData.set('name', input.name)
  if (input.description !== undefined) formData.set('description', input.description ?? '')
  if (input.categories !== undefined) formData.set('categories', JSON.stringify(input.categories))
  if (input.tags !== undefined) formData.set('tags', JSON.stringify(input.tags))
  formData.set(IMAGE_FIELD, image)
  return formData
}
