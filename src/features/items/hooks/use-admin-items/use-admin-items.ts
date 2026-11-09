'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import {
  ITEMS_QUERY_KEY,
  createItem,
  deleteItem,
  fetchAdminItem,
  listAdminItems,
  updateItem,
} from '@/data-access/items/items.api'
import type { CreateItemInput, ListItemsQuery } from '@/features/items/items.input-schemas'
import type { AdminItemDetailParsed, AdminItemsUpdateRequestInput, ItemWithSourcesDetailParsed, PaginatedResponse } from '@keimelion/sdk/schemas'

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
): UseQueryResult<PaginatedResponse<AdminItemDetailParsed>> {
  return useQuery({
    queryKey: buildAdminItemsKey(filters),
    queryFn: () => listAdminItems(filters),
  })
}

const DISABLED_ADMIN_ITEM_KEY = [...ITEMS_QUERY_KEY, 'detail', null] as const

export function useAdminItem(id: string | null): UseQueryResult<AdminItemDetailParsed> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_ITEM_KEY : buildAdminItemKey(id),
    queryFn: () => fetchAdminItem(id ?? ''),
    enabled: id !== null,
  })
}

interface CreateItemVariables {
  input: Omit<CreateItemInput, 'image'>
  image: File | null
}

export function useCreateItem(): UseMutationResult<ItemWithSourcesDetailParsed, Error, CreateItemVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ input, image }) => createItem(input, image),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

interface UpdateItemVariables {
  id: string
  input: AdminItemsUpdateRequestInput
  image: File | null
}

export function useUpdateItem(): UseMutationResult<ItemWithSourcesDetailParsed, Error, UpdateItemVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input, image }) => updateItem(id, input, image),
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
