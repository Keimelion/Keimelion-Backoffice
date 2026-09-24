'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import {
  ITEMS_QUERY_KEY,
  createItem,
  restoreItem,
  softDeleteItem,
  updateItem,
} from '@/data-access/items/items.api'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import type { CreateItemInput, UpdateItemInput } from '@/data-access/items/items.schemas'

export interface UpdateItemVariables {
  id: string
  input: UpdateItemInput
}

function useInvalidateItems(): (id?: string) => Promise<void> {
  const queryClient = useQueryClient()
  return async (id) => {
    await queryClient.invalidateQueries({ queryKey: [...ITEMS_QUERY_KEY, 'list'] })
    if (id !== undefined) {
      await queryClient.invalidateQueries({ queryKey: [...ITEMS_QUERY_KEY, 'detail', id] })
    }
  }
}

export function useCreateItem(): UseMutationResult<ApiAdminItem, Error, CreateItemInput> {
  const invalidateItems = useInvalidateItems()

  return useMutation({
    mutationFn: createItem,
    meta: { silent: true },
    onSuccess: async () => {
      await invalidateItems()
    },
  })
}

export function useUpdateItem(): UseMutationResult<ApiAdminItem, Error, UpdateItemVariables> {
  const invalidateItems = useInvalidateItems()

  return useMutation({
    mutationFn: ({ id, input }: UpdateItemVariables) => updateItem(id, input),
    meta: { silent: true },
    onSuccess: async (_item, variables) => {
      await invalidateItems(variables.id)
    },
  })
}

export function useSoftDeleteItem(): UseMutationResult<void, Error, string> {
  const invalidateItems = useInvalidateItems()

  return useMutation({
    mutationFn: softDeleteItem,
    meta: { silent: true },
    onSuccess: async (_result, id) => {
      await invalidateItems(id)
    },
  })
}

export function useRestoreItem(): UseMutationResult<ApiAdminItem, Error, string> {
  const invalidateItems = useInvalidateItems()

  return useMutation({
    mutationFn: restoreItem,
    onSuccess: async (_item, id) => {
      await invalidateItems(id)
    },
  })
}
