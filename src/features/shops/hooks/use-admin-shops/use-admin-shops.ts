'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { useReorderMutation } from '@/components/shared/data-table'
import type { ReorderUpdate } from '@/components/shared/data-table'
import {
  SHOPS_QUERY_KEY,
  createShop,
  deleteShop,
  listAdminShops,
  updateShop,
} from '@/data-access/shops/admin-shops.api'
import type {
  AdminShop,
  CreateShopInput,
  ListShopsQuery,
  UpdateShopInput,
} from '@/data-access/shops/admin-shops.schemas'

type ShopsListFilters = Partial<ListShopsQuery>

export function buildAdminShopsKey(
  filters: ShopsListFilters,
): readonly ['shops', 'list', ShopsListFilters] {
  const normalized = normalizeFilters(filters)
  return [...SHOPS_QUERY_KEY, 'list', normalized] as const
}

export function useAdminShops(
  filters: ShopsListFilters,
): UseQueryResult<PaginatedResponse<AdminShop>> {
  return useQuery({
    queryKey: buildAdminShopsKey(filters),
    queryFn: () => listAdminShops(filters),
  })
}

export function useCreateShop(): UseMutationResult<AdminShop, Error, CreateShopInput> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createShop,
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SHOPS_QUERY_KEY })
    },
  })
}

interface UpdateShopVariables {
  id: string
  input: UpdateShopInput
}

export function useUpdateShop(): UseMutationResult<AdminShop, Error, UpdateShopVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateShop(id, input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SHOPS_QUERY_KEY })
    },
  })
}

export function useDeleteShop(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteShop,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SHOPS_QUERY_KEY })
    },
  })
}

function reorderShops(updates: ReorderUpdate[]): Promise<AdminShop[]> {
  return Promise.all(updates.map(({ id, sortOrder }) => updateShop(id, { sortOrder })))
}

export function useReorderShops(filters: ShopsListFilters): ReturnType<typeof useReorderMutation<AdminShop>> {
  return useReorderMutation<AdminShop>({
    queryKey: buildAdminShopsKey(filters),
    invalidateKey: SHOPS_QUERY_KEY,
    mutationFn: reorderShops,
    errorMessageKey: 'common.reorder.error_message',
  })
}

function normalizeFilters(filters: ShopsListFilters): ShopsListFilters {
  const entries = Object.entries(filters) as [keyof ShopsListFilters, ShopsListFilters[keyof ShopsListFilters]][]
  const normalized = entries
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(normalized)
}
