'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import {
  createItemSource,
  deleteItemSource,
  updateItemSource,
} from '@/data-access/items/item-sources.api'
import type { ApiItemSource, CreateItemSourceInput, UpdateItemSourceInput } from '@/data-access/items/item-sources.schemas'
import { buildItemSourcesKey } from '@/features/items/hooks/use-item-sources'

export interface CreateItemSourceVariables {
  itemId: string
  input: CreateItemSourceInput
}

export interface UpdateItemSourceVariables {
  itemId: string
  sourceId: string
  input: UpdateItemSourceInput
}

export interface DeleteItemSourceVariables {
  itemId: string
  sourceId: string
}

export function useCreateItemSource(): UseMutationResult<ApiItemSource, Error, CreateItemSourceVariables> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, input }: CreateItemSourceVariables) => createItemSource(itemId, input),
    meta: { silent: true },
    onSuccess: async (_source, variables) => {
      await queryClient.invalidateQueries({ queryKey: buildItemSourcesKey(variables.itemId) })
    },
  })
}

export function useUpdateItemSource(): UseMutationResult<ApiItemSource, Error, UpdateItemSourceVariables> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, sourceId, input }: UpdateItemSourceVariables) =>
      updateItemSource(itemId, sourceId, input),
    meta: { silent: true },
    onSuccess: async (_source, variables) => {
      await queryClient.invalidateQueries({ queryKey: buildItemSourcesKey(variables.itemId) })
    },
  })
}

export function useDeleteItemSource(): UseMutationResult<void, Error, DeleteItemSourceVariables> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, sourceId }: DeleteItemSourceVariables) => deleteItemSource(itemId, sourceId),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: buildItemSourcesKey(variables.itemId) })
    },
  })
}
