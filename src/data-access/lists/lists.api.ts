import type { ListStatus } from '@keimelion/sdk/enums'
import type {
  AdminListDetailParsed,
  AdminListsListItemsResponseParsed,
  AdminListsListResponseParsed,
  AdminListsUpdateRequestInput,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'
import { emptyToUndefined } from '@/data-access/_shared/query-params'
import type { Currency } from '@/lib/i18n/currency'
import { useCurrencyStore } from '@/lib/i18n/currency-store'

export const LISTS_QUERY_KEY = ['lists'] as const

export interface ListAdminListsParams {
  page?: number | undefined
  limit?: number | undefined
  id?: string | undefined
  search?: string | undefined
  listStatus?: ListStatus | undefined
  occasionTypeId?: string | undefined
  ownerUserId?: string | undefined
  sort?: string | undefined
}

export interface ListAdminListItemsParams {
  page: number
  limit: number
}

export async function listAdminLists(
  input: ListAdminListsParams,
): Promise<AdminListsListResponseParsed> {
  return apiClient.admin.lists.list({
    page: input.page,
    limit: input.limit,
    sort: input.sort,
    currency: getDisplayCurrency(),
    ownerUserId: input.ownerUserId,
    'id[eq]': input.id,
    'title[ilike]': emptyToUndefined(input.search),
    'listStatus[eq]': input.listStatus,
    'occasionTypeId[eq]': input.occasionTypeId,
  })
}

export async function fetchAdminList(id: string): Promise<AdminListDetailParsed> {
  const { list } = await apiClient.admin.lists.get(id, { currency: getDisplayCurrency() })
  return list
}

export async function updateList(
  id: string,
  input: AdminListsUpdateRequestInput,
): Promise<AdminListDetailParsed> {
  const { list } = await apiClient.admin.lists.update(id, input)
  return list
}

export async function deleteList(id: string): Promise<void> {
  await apiClient.admin.lists.delete(id)
}

export async function restoreList(id: string): Promise<AdminListDetailParsed> {
  const { list } = await apiClient.admin.lists.restore(id)
  return list
}

export async function listAdminListItems(
  listId: string,
  pagination: ListAdminListItemsParams,
): Promise<AdminListsListItemsResponseParsed> {
  return apiClient.admin.lists.listItems(listId, {
    page: pagination.page,
    limit: pagination.limit,
    currency: getDisplayCurrency(),
  })
}

function getDisplayCurrency(): Currency {
  return useCurrencyStore.getState().currency
}
