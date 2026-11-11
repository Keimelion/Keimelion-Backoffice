import type { Locale } from '@keimelion/sdk/enums'
import type {
  AdminOccasionTypeDetailParsed,
  AdminOccasionTypesCreateRequestInput,
  AdminOccasionTypesListResponseParsed,
  AdminOccasionTypesUpdateRequestInput,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'
import { LOCALES } from '@/lib/i18n/locale'

export const OCCASION_TYPES_QUERY_KEY = ['occasion-types'] as const

interface ListAdminOccasionTypesParams {
  page?: number
  limit?: number
}

type OccasionTypeTranslationLabels = Partial<Record<Locale, string | null | undefined>>

export interface CreateOccasionTypePayload {
  slug: string
  emoji?: string | null | undefined
  sortOrder: number
  isActive: boolean
  translations: OccasionTypeTranslationLabels
}

export type UpdateOccasionTypePayload = Partial<Omit<CreateOccasionTypePayload, 'slug'>>

export async function listAdminOccasionTypes(
  params: ListAdminOccasionTypesParams,
): Promise<AdminOccasionTypesListResponseParsed> {
  return apiClient.admin.occasionTypes.list(params)
}

export async function createOccasionType(
  input: CreateOccasionTypePayload,
): Promise<AdminOccasionTypeDetailParsed> {
  const { occasionType } = await apiClient.admin.occasionTypes.create(buildCreatePayload(input))
  return occasionType
}

export async function updateOccasionType(
  id: string,
  input: UpdateOccasionTypePayload,
): Promise<AdminOccasionTypeDetailParsed> {
  const { occasionType } = await apiClient.admin.occasionTypes.update(id, buildUpdatePayload(input))
  return occasionType
}

export async function deleteOccasionType(id: string): Promise<void> {
  await apiClient.admin.occasionTypes.delete(id)
}

export async function patchOccasionTypeSortOrder(
  id: string,
  sortOrder: number,
): Promise<AdminOccasionTypeDetailParsed> {
  const { occasionType } = await apiClient.admin.occasionTypes.update(id, { sortOrder })
  return occasionType
}

function buildCreatePayload(input: CreateOccasionTypePayload): AdminOccasionTypesCreateRequestInput {
  const translations = LOCALES.flatMap((locale) => {
    const label = input.translations[locale]
    if (typeof label !== 'string' || label.length === 0) return []
    return [{ locale, label }]
  })
  return {
    slug: input.slug,
    emoji: input.emoji ?? null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    translations,
  }
}

function buildUpdatePayload(input: UpdateOccasionTypePayload): AdminOccasionTypesUpdateRequestInput {
  const payload: AdminOccasionTypesUpdateRequestInput = {}
  if (input.emoji !== undefined) payload.emoji = input.emoji
  if (input.sortOrder !== undefined) payload.sortOrder = input.sortOrder
  if (input.isActive !== undefined) payload.isActive = input.isActive
  if (input.translations !== undefined) {
    payload.translations = LOCALES.map((locale) => {
      const label = input.translations?.[locale]
      return { locale, label: typeof label === 'string' ? label : null }
    })
  }
  return payload
}
