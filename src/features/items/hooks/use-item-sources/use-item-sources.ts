'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { ITEM_SOURCES_QUERY_KEY, fetchItemSources } from '@/data-access/items/item-sources.api'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'

export function buildItemSourcesKey(itemId: string): readonly ['items', 'sources', string] {
  return [...ITEM_SOURCES_QUERY_KEY, itemId] as const
}

export function useItemSources(itemId: string): UseQueryResult<ApiItemSource[]> {
  return useQuery({
    queryKey: buildItemSourcesKey(itemId),
    queryFn: () => fetchItemSources(itemId),
  })
}
