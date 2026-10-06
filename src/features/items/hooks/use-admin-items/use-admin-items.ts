'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import {
  ITEMS_QUERY_KEY,
  createItem,
  deleteItem,
  fetchAdminItem,
  listAdminItems,
  updateItem,
} from '@/data-access/items/items.api'
import type {
  ApiAdminItem,
  CreateItemInput,
  ListItemsQuery,
  UpdateItemInput,
} from '@/data-access/items/items.schemas'

type ItemsListFilters = Partial<ListItemsQuery>

export function buildAdminItemsKey(
  filters: ItemsListFilters,
): readonly ['items', 'list', ItemsListFilters] {
  const normalized = normalizeFilters(filters)
  return [...ITEMS_QUERY_KEY, 'list', normalized] as const
}

export function buildAdminItemKey(id: string): readonly ['items', 'detail', string] {
  return [...ITEMS_QUERY_KEY, 'detail', id] as const
}

export function useAdminItems(
  filters: ItemsListFilters,
): UseQueryResult<PaginatedResponse<ApiAdminItem>> {
  return useQuery({
    queryKey: buildAdminItemsKey(filters),
    queryFn: () => listAdminItems(filters),
  })
}

const DISABLED_ADMIN_ITEM_KEY = [...ITEMS_QUERY_KEY, 'detail', null] as const

export function useAdminItem(id: string | null): UseQueryResult<ApiAdminItem> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_ITEM_KEY : buildAdminItemKey(id),
    queryFn: () => fetchAdminItem(id ?? ''),
    enabled: id !== null,
  })
}

export function useCreateItem(): UseMutationResult<ApiAdminItem, Error, CreateItemInput> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createItem,
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

interface UpdateItemVariables {
  id: string
  input: UpdateItemInput
}

export function useUpdateItem(): UseMutationResult<ApiAdminItem, Error, UpdateItemVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateItem(id, input),
    meta: { silent: true },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminItemKey(variables.id) }),
      ])
    },
  })
}

export function useDeleteItem(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

function normalizeFilters(filters: ItemsListFilters): ItemsListFilters {
  const entries = Object.entries(filters) as [keyof ItemsListFilters, ItemsListFilters[keyof ItemsListFilters]][]
  const normalized = entries
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(normalized)
}
