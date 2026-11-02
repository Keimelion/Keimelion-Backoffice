'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { LISTS_QUERY_KEY, listAdminListItems } from '@/data-access/lists/lists.api'
import type {
  ApiAdminListItem,
  ListItemsPaginationQuery,
} from '@/data-access/lists/lists.schemas'
import { useCurrencyStore } from '@/lib/i18n/currency-store'
import type { Currency } from '@/lib/i18n/currency'

export function buildAdminListItemsKey(
  listId: string,
  pagination: ListItemsPaginationQuery,
  currency: Currency,
): readonly ['lists', 'items', string, { page: number; limit: number }, Currency] {
  return [...LISTS_QUERY_KEY, 'items', listId, { page: pagination.page, limit: pagination.limit }, currency] as const
}

const DISABLED_ADMIN_LIST_ITEMS_KEY = [...LISTS_QUERY_KEY, 'items', null] as const

export function useAdminListItems(
  listId: string | null,
  pagination: ListItemsPaginationQuery,
): UseQueryResult<PaginatedResponse<ApiAdminListItem>> {
  const currency = useCurrencyStore((state) => state.currency)
  return useQuery({
    queryKey: listId === null ? DISABLED_ADMIN_LIST_ITEMS_KEY : buildAdminListItemsKey(listId, pagination, currency),
    queryFn: () => {
      if (listId === null) throw new Error('useAdminListItems: listId must not be null when the query runs')
      return listAdminListItems(listId, pagination)
    },
    enabled: listId !== null,
  })
}
