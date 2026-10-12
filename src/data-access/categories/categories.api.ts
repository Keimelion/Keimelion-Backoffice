import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminCategoryListResponseSchema,
  adminCategoryMutationResponseSchema,
  type ApiCategory,
  type CreateCategoryInput,
  type ListCategoriesQuery,
  type UpdateCategoryInput,
} from './categories.schemas'

export const CATEGORIES_QUERY_KEY = ['categories'] as const

function buildListParams(input: Partial<ListCategoriesQuery>): Record<string, string> {
  const params: Record<string, string> = {}
  if (input.page !== undefined) params.page = String(input.page)
  if (input.limit !== undefined) params.limit = String(input.limit)
  if (typeof input.search === 'string' && input.search.length > 0) {
    params['name[ilike]'] = input.search
  }
  if (input.depth !== undefined) {
    params['depth[eq]'] = String(input.depth)
  }
  if (typeof input.parentId === 'string' && input.parentId.length > 0) {
    params['parentId[eq]'] = input.parentId
  }
  if (input.sort !== undefined) params.sort = input.sort
  return params
}

export async function listAdminCategories(
  input: Partial<ListCategoriesQuery>,
): Promise<PaginatedResponse<ApiCategory>> {
  const response = await axiosInstance.get<unknown>('/admin/categories', {
    params: buildListParams(input),
  })
  return parseApiResponse(adminCategoryListResponseSchema, response, 'admin categories')
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
