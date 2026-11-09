import type {
  AdminTagsCreateRequestInput,
  AdminTagsListResponseParsed,
  AdminTagsUpdateRequestInput,
  TagDetailParsed,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'
import { emptyToUndefined } from '@/data-access/_shared/query-params'

export const TAGS_QUERY_KEY = ['tags'] as const

const DEFAULT_SORT = 'createdAt:desc'

export interface ListAdminTagsParams {
  page?: number | undefined
  limit?: number | undefined
  search?: string | undefined
}

export async function listAdminTags(
  input: ListAdminTagsParams,
): Promise<AdminTagsListResponseParsed> {
  return apiClient.admin.tags.list({
    page: input.page,
    limit: input.limit,
    sort: DEFAULT_SORT,
    'name[ilike]': emptyToUndefined(input.search),
  })
}

export async function fetchAdminTag(id: string): Promise<TagDetailParsed> {
  const { tag } = await apiClient.admin.tags.get(id)
  return tag
}

export async function createTag(input: AdminTagsCreateRequestInput): Promise<TagDetailParsed> {
  const { tag } = await apiClient.admin.tags.create(input)
  return tag
}

export async function updateTag(
  id: string,
  input: AdminTagsUpdateRequestInput,
): Promise<TagDetailParsed> {
  const { tag } = await apiClient.admin.tags.update(id, input)
  return tag
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.admin.tags.delete(id)
}
