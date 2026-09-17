'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { listAdminOccasionTypes } from '@/data-access/occasion-types/admin-occasion-types.api'
import type { AdminOccasionType } from '@/data-access/occasion-types/admin-occasion-types.schemas'

interface UseAdminOccasionTypesParams {
  page: number
  limit: number
}

export function buildAdminOccasionTypesKey(
  params: UseAdminOccasionTypesParams,
): ['occasion-types', 'admin', 'list', UseAdminOccasionTypesParams] {
  return ['occasion-types', 'admin', 'list', params]
}

export function useAdminOccasionTypes(
  params: UseAdminOccasionTypesParams,
): UseQueryResult<PaginatedResponse<AdminOccasionType>> {
  return useQuery({
    queryKey: buildAdminOccasionTypesKey(params),
    queryFn: () => listAdminOccasionTypes(params),
  })
}
