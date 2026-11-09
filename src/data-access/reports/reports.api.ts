import type {
  AdminReportDetailParsed,
  AdminReportsListResponseParsed,
  AdminReportsUpdateRequestInput,
} from '@keimelion/sdk/schemas'
import type { ReportReason, ReportStatus, ReportTargetType } from '@keimelion/sdk/enums'
import { apiClient } from '@/data-access/_shared/client'
import { toDayEndIso, toDayStartIso } from '@/data-access/_shared/query-params'

export const REPORTS_QUERY_KEY = ['reports'] as const

export interface ListAdminReportsParams {
  page?: number | undefined
  limit?: number | undefined
  status?: ReportStatus | undefined
  targetType?: ReportTargetType | undefined
  reason?: ReportReason | undefined
  createdFrom?: string | undefined
  createdTo?: string | undefined
  sort?: string | undefined
}

export async function listAdminReports(
  input: ListAdminReportsParams,
): Promise<AdminReportsListResponseParsed> {
  return apiClient.admin.reports.list({
    page: input.page,
    limit: input.limit,
    sort: input.sort,
    'status[eq]': input.status,
    'targetType[eq]': input.targetType,
    'reason[eq]': input.reason,
    'createdAt[gte]': toDayStartIso(input.createdFrom),
    'createdAt[lte]': toDayEndIso(input.createdTo),
  })
}

export async function updateAdminReport(
  id: string,
  input: AdminReportsUpdateRequestInput,
): Promise<AdminReportDetailParsed> {
  const { report } = await apiClient.admin.reports.update(id, input)
  return report
}
