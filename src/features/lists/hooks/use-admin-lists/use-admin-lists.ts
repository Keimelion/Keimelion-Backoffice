'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  LISTS_QUERY_KEY,
  deleteList,
  fetchAdminList,
  listAdminLists,
  restoreList,
  updateList,
} from '@/data-access/lists/lists.api'
import type { ListListsQuery } from '@/features/lists/lists.input-schemas'
import { useCurrencyStore } from '@/lib/i18n/currency-store'
import type { Currency } from '@/lib/i18n/currency'
import type { AdminListDetailParsed, AdminListsUpdateRequestInput, PaginatedResponse } from '@keimelion/sdk/schemas'

type ListsFilters = Partial<ListListsQuery>

export function buildAdminListsKey(
  filters: ListsFilters,
  currency: Currency,
): readonly ['lists', 'list', ListsFilters, Currency] {
  const normalized = normalizeFilters(filters)
  return [...LISTS_QUERY_KEY, 'list', normalized, currency] as const
}

export function buildAdminListKey(id: string): readonly ['lists', 'detail', string] {
  return [...LISTS_QUERY_KEY, 'detail', id] as const
}

const DISABLED_ADMIN_LIST_KEY = [...LISTS_QUERY_KEY, 'detail', null] as const

interface UseAdminListsOptions {
  enabled?: boolean
}

export function useAdminLists(
  filters: ListsFilters,
  options: UseAdminListsOptions = {},
): UseQueryResult<PaginatedResponse<AdminListDetailParsed>> {
  const currency = useCurrencyStore((state) => state.currency)
  return useQuery({
    queryKey: buildAdminListsKey(filters, currency),
    queryFn: () => listAdminLists(filters),
    enabled: options.enabled ?? true,
  })
}

export function useAdminList(id: string | null): UseQueryResult<AdminListDetailParsed> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_LIST_KEY : buildAdminListKey(id),
    queryFn: () => fetchAdminList(id ?? ''),
    enabled: id !== null,
  })
}

interface UpdateListVariables {
  id: string
  input: AdminListsUpdateRequestInput
}

export function useUpdateList(): UseMutationResult<AdminListDetailParsed, Error, UpdateListVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateList(id, input),
    meta: { silent: true },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminListKey(variables.id) }),
      ])
    },
  })
}

export function useDeleteList(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteList,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY })
    },
  })
}

export function useRestoreList(): UseMutationResult<AdminListDetailParsed, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: restoreList,
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminListKey(id) }),
      ])
    },
  })
}
