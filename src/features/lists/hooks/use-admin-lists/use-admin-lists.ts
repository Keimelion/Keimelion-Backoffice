'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  LISTS_QUERY_KEY,
  deleteList,
  fetchAdminList,
  listAdminLists,
  restoreList,
  updateList,
} from '@/data-access/lists/lists.api'
import type {
  ApiAdminList,
  ListListsQuery,
  UpdateListInput,
} from '@/data-access/lists/lists.schemas'

type ListsFilters = Partial<ListListsQuery>

export function buildAdminListsKey(
  filters: ListsFilters,
): readonly ['lists', 'list', ListsFilters] {
  const normalized = normalizeFilters(filters)
  return [...LISTS_QUERY_KEY, 'list', normalized] as const
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
): UseQueryResult<PaginatedResponse<ApiAdminList>> {
  return useQuery({
    queryKey: buildAdminListsKey(filters),
    queryFn: () => listAdminLists(filters),
    enabled: options.enabled ?? true,
  })
}

export function useAdminList(id: string | null): UseQueryResult<ApiAdminList> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_LIST_KEY : buildAdminListKey(id),
    queryFn: () => fetchAdminList(id ?? ''),
    enabled: id !== null,
  })
}

interface UpdateListVariables {
  id: string
  input: UpdateListInput
}

export function useUpdateList(): UseMutationResult<ApiAdminList, Error, UpdateListVariables> {
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

export function useRestoreList(): UseMutationResult<ApiAdminList, Error, string> {
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
