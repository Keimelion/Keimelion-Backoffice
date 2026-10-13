import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import {
  adminCategoryListResponseSchema,
  adminCategoryMutationResponseSchema,
  resolveCategoryName,
  type ApiCategory,
  type ApiCategoryResponse,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './categories.schemas'

export const CATEGORIES_QUERY_KEY = ['categories'] as const

function augmentWithName(raw: ApiCategoryResponse): ApiCategory {
  const locale = useLocaleStore.getState().locale
  return { ...raw, name: resolveCategoryName(raw.translations, locale) }
}

export async function listAdminCategories(): Promise<ApiCategory[]> {
  const response = await axiosInstance.get<unknown>('/admin/categories')
  const parsed = parseApiResponse(adminCategoryListResponseSchema, response, 'admin categories')
  return parsed.items.map(augmentWithName)
}

export async function fetchAdminCategory(id: string): Promise<ApiCategory> {
  const response = await axiosInstance.get<unknown>(`/admin/categories/${id}`)
  const parsed = parseApiResponse(adminCategoryMutationResponseSchema, response, 'admin category')
  return augmentWithName(parsed.category)
}

export async function createCategory(input: CreateCategoryInput): Promise<ApiCategory> {
  const response = await axiosInstance.post<unknown>('/admin/categories', input)
  const parsed = parseApiResponse(adminCategoryMutationResponseSchema, response, 'admin category')
  return augmentWithName(parsed.category)
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<ApiCategory> {
  const response = await axiosInstance.patch<unknown>(`/admin/categories/${id}`, input)
  const parsed = parseApiResponse(adminCategoryMutationResponseSchema, response, 'admin category')
  return augmentWithName(parsed.category)
}

export async function deleteCategory(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/categories/${id}`)
}
