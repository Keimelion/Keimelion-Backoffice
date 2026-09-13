'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { fetchOccasionTypes } from '@/data-access/occasion-types/occasion-types.api'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import type { Locale } from '@/lib/i18n/locale'
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'

export function buildOccasionTypesQueryKey(locale: Locale): ['occasion-types', 'list', Locale] {
  return ['occasion-types', 'list', locale]
}

export const OCCASION_TYPES_QUERY_KEY = buildOccasionTypesQueryKey

export function useOccasionTypes(): UseQueryResult<ApiOccasionType[]> {
  const locale = useLocaleStore((state) => state.locale)
  return useQuery({
    queryKey: buildOccasionTypesQueryKey(locale),
    queryFn: fetchOccasionTypes,
  })
}
