'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { LISTS_QUERY_KEY, listAdminListItems } from '@/data-access/lists/lists.api'
import type { ListItemsPaginationQuery } from '@/features/lists/lists.input-schemas'
import { useCurrencyStore } from '@/lib/i18n/currency-store'
import type { Currency } from '@/lib/i18n/currency'
import type { AdminListItemDetailParsed, PaginatedResponse } from '@keimelion/sdk/schemas'

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
): UseQueryResult<PaginatedResponse<AdminListItemDetailParsed>> {
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
