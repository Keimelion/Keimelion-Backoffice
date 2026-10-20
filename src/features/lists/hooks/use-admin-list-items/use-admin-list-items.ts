'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { LISTS_QUERY_KEY, listAdminListItems } from '@/data-access/lists/lists.api'
import type {
  ApiAdminListItem,
  ListItemsPaginationQuery,
} from '@/data-access/lists/lists.schemas'

export function buildAdminListItemsKey(
  listId: string,
  pagination: ListItemsPaginationQuery,
): readonly ['lists', 'items', string, { page: number; limit: number }] {
  return [...LISTS_QUERY_KEY, 'items', listId, { page: pagination.page, limit: pagination.limit }] as const
}

const DISABLED_ADMIN_LIST_ITEMS_KEY = [...LISTS_QUERY_KEY, 'items', null] as const

export function useAdminListItems(
  listId: string | null,
  pagination: ListItemsPaginationQuery,
): UseQueryResult<PaginatedResponse<ApiAdminListItem>> {
  return useQuery({
    queryKey: listId === null ? DISABLED_ADMIN_LIST_ITEMS_KEY : buildAdminListItemsKey(listId, pagination),
    queryFn: () => {
      if (listId === null) throw new Error('useAdminListItems: listId must not be null when the query runs')
      return listAdminListItems(listId, pagination)
    },
    enabled: listId !== null,
  })
}
