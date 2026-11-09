'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  REPORTS_QUERY_KEY,
  listAdminReports,
  type ListAdminReportsParams,
} from '@/data-access/reports/reports.api'
import { ALL_REPORT_STATUSES } from '@/features/reports/reports.input-schemas'
import type { ListReportsQuery } from '@/features/reports/reports.input-schemas'
import type { AdminReportDetailParsed, PaginatedResponse } from '@keimelion/sdk/schemas'

type ReportsFilters = Partial<ListReportsQuery>

export function buildAdminReportsKey(
  filters: ReportsFilters,
): readonly ['reports', 'list', ReportsFilters] {
  const normalized = normalizeFilters(filters)
  return [...REPORTS_QUERY_KEY, 'list', normalized] as const
}

export function useAdminReports(
  filters: ReportsFilters,
): UseQueryResult<PaginatedResponse<AdminReportDetailParsed>> {
  return useQuery({
    queryKey: buildAdminReportsKey(filters),
    queryFn: () => listAdminReports(toListParams(filters)),
  })
}

function toListParams({ status, ...filters }: ReportsFilters): ListAdminReportsParams {
  return { ...filters, status: status === ALL_REPORT_STATUSES ? undefined : status }
}
