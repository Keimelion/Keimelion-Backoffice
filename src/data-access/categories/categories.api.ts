import type {
  AdminCategoriesCreateRequestInput,
  AdminCategoriesUpdateRequestInput,
  AdminCategoryDetailParsed,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

export const CATEGORIES_QUERY_KEY = ['categories'] as const

export async function listAdminCategories(): Promise<AdminCategoryDetailParsed[]> {
  const { items } = await apiClient.admin.categories.list()
  return items
}

export async function fetchAdminCategory(id: string): Promise<AdminCategoryDetailParsed> {
  const { category } = await apiClient.admin.categories.get(id)
  return category
}

export async function createCategory(
  input: AdminCategoriesCreateRequestInput,
): Promise<AdminCategoryDetailParsed> {
  const { category } = await apiClient.admin.categories.create(input)
  return category
}

export async function updateCategory(
  id: string,
  input: AdminCategoriesUpdateRequestInput,
): Promise<AdminCategoryDetailParsed> {
  const { category } = await apiClient.admin.categories.update(id, input)
  return category
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.admin.categories.delete(id)
}
