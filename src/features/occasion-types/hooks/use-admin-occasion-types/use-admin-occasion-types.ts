'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { OCCASION_TYPES_QUERY_KEY, listAdminOccasionTypes } from '@/data-access/occasion-types/admin-occasion-types.api'
import type { AdminOccasionType } from '@/data-access/occasion-types/admin-occasion-types.schemas'

interface UseAdminOccasionTypesParams {
  page: number
  limit: number
}

export function buildAdminOccasionTypesKey(
  params: UseAdminOccasionTypesParams,
): readonly ['occasion-types', 'admin', 'list', UseAdminOccasionTypesParams] {
  return [...OCCASION_TYPES_QUERY_KEY, 'admin', 'list', params] as const
}

export function useAdminOccasionTypes(
  params: UseAdminOccasionTypesParams,
): UseQueryResult<PaginatedResponse<AdminOccasionType>> {
  return useQuery({
    queryKey: buildAdminOccasionTypesKey(params),
    queryFn: () => listAdminOccasionTypes(params),
  })
}
