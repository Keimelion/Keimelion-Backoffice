'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  CATEGORIES_QUERY_KEY,
  createCategory,
  deleteCategory,
  fetchAdminCategory,
  listAdminCategories,
  updateCategory,
} from '@/data-access/categories/categories.api'
import type {
  ApiCategory,
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from '@/data-access/categories/categories.schemas'

type CategoriesListFilters = Partial<ListCategoriesQuery>

export function buildAdminCategoriesKey(
  filters: CategoriesListFilters,
): readonly ['categories', 'list', CategoriesListFilters] {
  const normalized = normalizeFilters(filters)
  return [...CATEGORIES_QUERY_KEY, 'list', normalized] as const
}

export function buildAdminCategoryKey(id: string): readonly ['categories', 'detail', string] {
  return [...CATEGORIES_QUERY_KEY, 'detail', id] as const
}

const DISABLED_ADMIN_CATEGORY_KEY = [...CATEGORIES_QUERY_KEY, 'detail', null] as const

export function useAdminCategories(
  filters: CategoriesListFilters,
): UseQueryResult<PaginatedResponse<ApiCategory>> {
  return useQuery({
    queryKey: buildAdminCategoriesKey(filters),
    queryFn: () => listAdminCategories(filters),
  })
}

export function useAdminCategory(id: string | null): UseQueryResult<ApiCategory> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_CATEGORY_KEY : buildAdminCategoryKey(id),
    queryFn: () => fetchAdminCategory(id ?? ''),
    enabled: id !== null,
  })
}

export function useCreateCategory(): UseMutationResult<ApiCategory, Error, CreateCategoryInput> {
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
  input: UpdateCategoryInput
}

export function useUpdateCategory(): UseMutationResult<ApiCategory, Error, UpdateCategoryVariables> {
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
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}
