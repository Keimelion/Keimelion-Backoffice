'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { HealthGetResponseParsed } from '@keimelion/sdk/schemas'
import { fetchHealth } from '@/data-access/health/health.api'

export const API_VERSION_QUERY_KEY = ['health', 'version'] as const

function selectVersion(health: HealthGetResponseParsed): string {
  return health.version
}

export function useApiVersion(): UseQueryResult<string> {
  return useQuery({
    queryKey: API_VERSION_QUERY_KEY,
    queryFn: fetchHealth,
    select: selectVersion,
  })
}
