'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { SHOPS_QUERY_KEY, fetchShops } from '@/data-access/shops/shops.api'
import type { ApiShop } from '@/data-access/shops/shops.schemas'

export function useShops(): UseQueryResult<ApiShop[]> {
  return useQuery({
    queryKey: [...SHOPS_QUERY_KEY, 'list'],
    queryFn: fetchShops,
  })
}
