import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminCategoryListResponseSchema,
  adminCategoryMutationResponseSchema,
  type ApiCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './categories.schemas'

export const CATEGORIES_QUERY_KEY = ['categories'] as const

export async function listAdminCategories(): Promise<ApiCategory[]> {
  const response = await axiosInstance.get<unknown>('/admin/categories')
  const parsed = parseApiResponse(adminCategoryListResponseSchema, response, 'admin categories')
  return parsed.items
}

export async function fetchAdminCategory(id: string): Promise<ApiCategory> {
  const response = await axiosInstance.get<unknown>(`/admin/categories/${id}`)
  const parsed = parseApiResponse(adminCategoryMutationResponseSchema, response, 'admin category')
  return parsed.category
}

export async function createCategory(input: CreateCategoryInput): Promise<ApiCategory> {
  const response = await axiosInstance.post<unknown>('/admin/categories', input)
  const parsed = parseApiResponse(adminCategoryMutationResponseSchema, response, 'admin category')
  return parsed.category
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<ApiCategory> {
  const response = await axiosInstance.patch<unknown>(`/admin/categories/${id}`, input)
  const parsed = parseApiResponse(adminCategoryMutationResponseSchema, response, 'admin category')
  return parsed.category
}

export async function deleteCategory(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/categories/${id}`)
}
