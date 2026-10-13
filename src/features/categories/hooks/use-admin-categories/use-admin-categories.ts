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
import type {
  ApiCategory,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/data-access/categories/categories.schemas'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import type { Locale } from '@/lib/i18n/locale'

export function buildAdminCategoriesKey(
  locale: Locale,
): readonly ['categories', 'list', Locale] {
  return [...CATEGORIES_QUERY_KEY, 'list', locale] as const
}

export function buildAdminCategoryKey(
  id: string,
  locale: Locale,
): readonly ['categories', 'detail', string, Locale] {
  return [...CATEGORIES_QUERY_KEY, 'detail', id, locale] as const
}

function buildDisabledAdminCategoryKey(
  locale: Locale,
): readonly ['categories', 'detail', null, Locale] {
  return [...CATEGORIES_QUERY_KEY, 'detail', null, locale] as const
}

export function useAdminCategories(): UseQueryResult<ApiCategory[]> {
  const locale = useLocaleStore((state) => state.locale)
  return useQuery({
    queryKey: buildAdminCategoriesKey(locale),
    queryFn: listAdminCategories,
  })
}

export function useAdminCategory(id: string | null): UseQueryResult<ApiCategory> {
  const locale = useLocaleStore((state) => state.locale)
  return useQuery({
    queryKey:
      id === null ? buildDisabledAdminCategoryKey(locale) : buildAdminCategoryKey(id, locale),
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
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
