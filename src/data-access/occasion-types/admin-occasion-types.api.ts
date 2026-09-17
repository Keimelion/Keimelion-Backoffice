import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import { buildQueryParams } from '@/data-access/_shared/query-params'
import {
  adminOccasionTypeListResponseSchema,
  adminOccasionTypeMutationResponseSchema,
  type AdminOccasionType,
  type CreateOccasionTypeInput,
  type UpdateOccasionTypeInput,
} from './admin-occasion-types.schemas'

export const OCCASION_TYPES_QUERY_KEY = ['occasion-types'] as const

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
  label: string | null
}

interface OccasionTypeMutationPayload {
  slug: string
  emoji: string | null
  sortOrder: number
  isActive: boolean
  translations: OccasionTypeTranslationPayload[]
}

type UpdateOccasionTypePayload = Omit<OccasionTypeMutationPayload, 'slug'>

function buildCreatePayload(input: CreateOccasionTypeInput): OccasionTypeMutationPayload {
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

function buildUpdatePayload(input: UpdateOccasionTypeInput): UpdateOccasionTypePayload {
  return {
    emoji: input.emoji ?? null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    translations: [
      { locale: 'en', label: input.labelEn },
      { locale: 'fr', label: input.labelFr ?? null },
    ],
  }
}

export async function createOccasionType(input: CreateOccasionTypeInput): Promise<AdminOccasionType> {
  const response = await axiosInstance.post<unknown>('/admin/occasion-types', buildCreatePayload(input))
  const parsed = parseApiResponse(adminOccasionTypeMutationResponseSchema, response, 'admin occasion type')
  return parsed.occasionType
}

export async function updateOccasionType(
  id: string,
  input: UpdateOccasionTypeInput,
): Promise<AdminOccasionType> {
  const response = await axiosInstance.patch<unknown>(`/admin/occasion-types/${id}`, buildUpdatePayload(input))
  const parsed = parseApiResponse(adminOccasionTypeMutationResponseSchema, response, 'admin occasion type')
  return parsed.occasionType
}

export async function deleteOccasionType(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/occasion-types/${id}`)
}
