'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { fetchOccasionTypes } from '@/data-access/occasion-types/occasion-types.api'
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'

export const OCCASION_TYPES_QUERY_KEY = ['occasion-types', 'list'] as const

export function useOccasionTypes(): UseQueryResult<ApiOccasionType[]> {
  return useQuery({
    queryKey: OCCASION_TYPES_QUERY_KEY,
    queryFn: fetchOccasionTypes,
  })
}
