'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import {
  createItemSource,
  deleteItemSource,
  updateItemSource,
} from '@/data-access/items/item-sources.api'
import { ITEMS_QUERY_KEY } from '@/data-access/items/items.api'
import { buildAdminItemKey } from '@/features/items/hooks/use-admin-items'
import type { AdminItemsCreateSourceRequestInput, AdminItemsUpdateSourceRequestInput, ItemSourceDetailParsed } from '@keimelion/sdk/schemas'

interface CreateItemSourceVariables {
  itemId: string
  input: AdminItemsCreateSourceRequestInput
}

export function useCreateItemSource(): UseMutationResult<ItemSourceDetailParsed, Error, CreateItemSourceVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, input }) => createItemSource(itemId, input),
    meta: { silent: true },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminItemKey(variables.itemId) }),
      ])
    },
  })
}

interface UpdateItemSourceVariables {
  itemId: string
  sourceId: string
  input: AdminItemsUpdateSourceRequestInput
}

export function useUpdateItemSource(): UseMutationResult<ItemSourceDetailParsed, Error, UpdateItemSourceVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, sourceId, input }) => updateItemSource(itemId, sourceId, input),
    meta: { silent: true },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminItemKey(variables.itemId) }),
      ])
    },
  })
}

interface DeleteItemSourceVariables {
  itemId: string
  sourceId: string
}

export function useDeleteItemSource(): UseMutationResult<void, Error, DeleteItemSourceVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, sourceId }) => deleteItemSource(itemId, sourceId),
    meta: { silent: true },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminItemKey(variables.itemId) }),
      ])
    },
  })
}
