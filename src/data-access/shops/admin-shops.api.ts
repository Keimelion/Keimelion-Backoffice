import type {
  AdminShopsCreateRequestInput,
  AdminShopsListResponseParsed,
  AdminShopsUpdateRequestInput,
  ShopDetailParsed,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'
import { emptyToUndefined } from '@/data-access/_shared/query-params'

export const SHOPS_QUERY_KEY = ['shops'] as const

export interface ListAdminShopsParams {
  page?: number | undefined
  limit?: number | undefined
  search?: string | undefined
  isActive?: boolean | undefined
  isAffiliated?: boolean | undefined
  sort?: string | undefined
}

export async function listAdminShops(
  input: ListAdminShopsParams,
): Promise<AdminShopsListResponseParsed> {
  return apiClient.admin.shops.list({
    page: input.page,
    limit: input.limit,
    sort: input.sort,
    'name[ilike]': emptyToUndefined(input.search),
    'isActive[eq]': input.isActive,
    'isAffiliated[eq]': input.isAffiliated,
  })
}

export async function createShop(input: AdminShopsCreateRequestInput): Promise<ShopDetailParsed> {
  const { shop } = await apiClient.admin.shops.create(normalizeCreatePayload(input))
  return shop
}

export async function updateShop(
  id: string,
  input: AdminShopsUpdateRequestInput,
): Promise<ShopDetailParsed> {
  const { shop } = await apiClient.admin.shops.update(id, normalizeUpdatePayload(input))
  return shop
}

export async function deleteShop(id: string): Promise<void> {
  await apiClient.admin.shops.delete(id)
}

function normalizeNullableString(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeCreatePayload(input: AdminShopsCreateRequestInput): AdminShopsCreateRequestInput {
  return {
    ...input,
    domain: input.domain === null ? null : normalizeNullableString(input.domain) ?? null,
    logoUrl: input.logoUrl === null ? null : normalizeNullableString(input.logoUrl) ?? null,
  }
}

function normalizeUpdatePayload(input: AdminShopsUpdateRequestInput): AdminShopsUpdateRequestInput {
  const payload: AdminShopsUpdateRequestInput = { ...input }
  if ('domain' in input) {
    const normalized = normalizeNullableString(input.domain)
    if (normalized === undefined) delete payload.domain
    else payload.domain = normalized
  }
  if ('logoUrl' in input) {
    const normalized = normalizeNullableString(input.logoUrl)
    if (normalized === undefined) delete payload.logoUrl
    else payload.logoUrl = normalized
  }
  return payload
}
