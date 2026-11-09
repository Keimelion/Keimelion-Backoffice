'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import {
  CATEGORIES_QUERY_KEY,
  createCategory,
  deleteCategory,
  fetchAdminCategory,
  listAdminCategories,
  updateCategory,
} from '@/data-access/categories/categories.api'
import { ITEMS_QUERY_KEY } from '@/data-access/items/items.api'
import type { AdminCategoriesCreateRequestInput, AdminCategoriesUpdateRequestInput, AdminCategoryDetailParsed } from '@keimelion/sdk/schemas'

const ADMIN_CATEGORIES_LIST_KEY = [...CATEGORIES_QUERY_KEY, 'list'] as const

export function buildAdminCategoriesKey(): typeof ADMIN_CATEGORIES_LIST_KEY {
  return ADMIN_CATEGORIES_LIST_KEY
}

export function buildAdminCategoryKey(id: string): readonly ['categories', 'detail', string] {
  return [...CATEGORIES_QUERY_KEY, 'detail', id] as const
}

const DISABLED_ADMIN_CATEGORY_KEY = [...CATEGORIES_QUERY_KEY, 'detail', null] as const

export function useAdminCategories(): UseQueryResult<AdminCategoryDetailParsed[]> {
  return useQuery({
    queryKey: ADMIN_CATEGORIES_LIST_KEY,
    queryFn: listAdminCategories,
  })
}

export function useAdminCategory(id: string | null): UseQueryResult<AdminCategoryDetailParsed> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_CATEGORY_KEY : buildAdminCategoryKey(id),
    queryFn: () => fetchAdminCategory(id ?? ''),
    enabled: id !== null,
  })
}

export function useCreateCategory(): UseMutationResult<AdminCategoryDetailParsed, Error, AdminCategoriesCreateRequestInput> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

interface UpdateCategoryVariables {
  id: string
  input: AdminCategoriesUpdateRequestInput
}

export function useUpdateCategory(): UseMutationResult<AdminCategoryDetailParsed, Error, UpdateCategoryVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateCategory(id, input),
    meta: { silent: true },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminCategoryKey(variables.id) }),
      ])
    },
  })
}

export function useDeleteCategory(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
      ])
    },
  })
}
