'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { ITEMS_QUERY_KEY, fetchItem, fetchItems } from '@/data-access/items/items.api'
import type { ListItemsParams } from '@/data-access/items/items.api'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'

export function buildItemsListKey(
  params: ListItemsParams,
): readonly ['items', 'list', ListItemsParams] {
  return [...ITEMS_QUERY_KEY, 'list', params] as const
}

export function useItems(params: ListItemsParams): UseQueryResult<PaginatedResponse<ApiAdminItem>> {
  return useQuery({
    queryKey: buildItemsListKey(params),
    queryFn: () => fetchItems(params),
  })
}

export function buildItemDetailKey(id: string): readonly ['items', 'detail', string] {
  return [...ITEMS_QUERY_KEY, 'detail', id] as const
}

interface UseItemOptions {
  enabled?: boolean
}

export function useItem(id: string, options?: UseItemOptions): UseQueryResult<ApiAdminItem> {
  return useQuery({
    queryKey: buildItemDetailKey(id),
    queryFn: () => fetchItem(id),
    enabled: options?.enabled ?? true,
  })
}
