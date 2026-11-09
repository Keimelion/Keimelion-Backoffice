'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import { useReorderMutation } from '@/components/shared/data-table'
import type { ReorderUpdate } from '@/components/shared/data-table'
import {
  SHOPS_QUERY_KEY,
  createShop,
  deleteShop,
  listAdminShops,
  updateShop,
} from '@/data-access/shops/admin-shops.api'
import type { ListShopsQuery } from '@/features/shops/shops.input-schemas'
import type { AdminShopsCreateRequestInput, AdminShopsUpdateRequestInput, PaginatedResponse, ShopDetailParsed } from '@keimelion/sdk/schemas'

type ShopsListFilters = Partial<ListShopsQuery>

export function buildAdminShopsKey(
  filters: ShopsListFilters,
): readonly ['shops', 'list', ShopsListFilters] {
  const normalized = normalizeFilters(filters)
  return [...SHOPS_QUERY_KEY, 'list', normalized] as const
}

export function useAdminShops(
  filters: ShopsListFilters,
): UseQueryResult<PaginatedResponse<ShopDetailParsed>> {
  return useQuery({
    queryKey: buildAdminShopsKey(filters),
    queryFn: () => listAdminShops(filters),
  })
}

export function useCreateShop(): UseMutationResult<ShopDetailParsed, Error, AdminShopsCreateRequestInput> {
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
  input: AdminShopsUpdateRequestInput
}

export function useUpdateShop(): UseMutationResult<ShopDetailParsed, Error, UpdateShopVariables> {
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

function reorderShops(updates: ReorderUpdate[]): Promise<ShopDetailParsed[]> {
  return Promise.all(updates.map(({ id, sortOrder }) => updateShop(id, { sortOrder })))
}

export function useReorderShops(filters: ShopsListFilters): ReturnType<typeof useReorderMutation<ShopDetailParsed>> {
  return useReorderMutation<ShopDetailParsed>({
    queryKey: buildAdminShopsKey(filters),
    invalidateKey: SHOPS_QUERY_KEY,
    mutationFn: reorderShops,
    errorMessageKey: 'common.reorder.error_message',
    successMessageKey: 'common.reorder.success_message',
  })
}

