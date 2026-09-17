import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import { buildQueryParams } from '@/data-access/_shared/query-params'
import {
  adminOccasionTypeListResponseSchema,
  adminOccasionTypeSchema,
  type AdminOccasionType,
  type CreateOccasionTypeInput,
  type UpdateOccasionTypeInput,
} from './admin-occasion-types.schemas'

interface ListAdminOccasionTypesParams {
  page?: number
  limit?: number
}

export async function listAdminOccasionTypes(
  params: ListAdminOccasionTypesParams,
): Promise<PaginatedResponse<AdminOccasionType>> {
  const response = await axiosInstance.get<unknown>('/admin/occasion-types', {
    params: buildQueryParams(params),
  })
  return parseApiResponse(adminOccasionTypeListResponseSchema, response, 'admin occasion types')
}

interface OccasionTypeTranslationPayload {
  locale: string
  label: string
}

interface CreateOccasionTypePayload {
  slug: string
  emoji: string | null | undefined
  sortOrder: number
  isActive: boolean
  translations: OccasionTypeTranslationPayload[]
}

function buildCreatePayload(input: CreateOccasionTypeInput): CreateOccasionTypePayload {
  const translations: OccasionTypeTranslationPayload[] = [
    { locale: 'en', label: input.labelEn },
  ]
  if (input.labelFr) {
    translations.push({ locale: 'fr', label: input.labelFr })
  }
  return {
    slug: input.slug,
    emoji: input.emoji ?? null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    translations,
  }
}

export async function createOccasionType(input: CreateOccasionTypeInput): Promise<AdminOccasionType> {
  const response = await axiosInstance.post<unknown>('/admin/occasion-types', buildCreatePayload(input))
  return parseApiResponse(adminOccasionTypeSchema, response, 'admin occasion type')
}

interface OccasionTypeUpdateTranslationPayload {
  locale: string
  label: string | null
}

interface UpdateOccasionTypePayload {
  emoji: string | null | undefined
  sortOrder: number
  isActive: boolean
  translations: OccasionTypeUpdateTranslationPayload[]
}

function buildUpdatePayload(input: UpdateOccasionTypeInput): UpdateOccasionTypePayload {
  const translations: OccasionTypeUpdateTranslationPayload[] = [
    { locale: 'en', label: input.labelEn },
    { locale: 'fr', label: input.labelFr ?? null },
  ]
  return {
    emoji: input.emoji ?? null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    translations,
  }
}

export async function updateOccasionType(
  id: string,
  input: UpdateOccasionTypeInput,
): Promise<AdminOccasionType> {
  const response = await axiosInstance.patch<unknown>(`/admin/occasion-types/${id}`, buildUpdatePayload(input))
  return parseApiResponse(adminOccasionTypeSchema, response, 'admin occasion type')
}

export async function deleteOccasionType(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/occasion-types/${id}`)
}
