'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { TAGS_QUERY_KEY, listAdminTags } from '@/data-access/tags/tags.api'
import type { ApiTag } from '@/data-access/tags/tags.schemas'

const ADMIN_TAGS_LIST_KEY = [...TAGS_QUERY_KEY, 'list'] as const

export function useAdminTags(): UseQueryResult<ApiTag[]> {
  return useQuery({
    queryKey: ADMIN_TAGS_LIST_KEY,
    queryFn: listAdminTags,
  })
}
