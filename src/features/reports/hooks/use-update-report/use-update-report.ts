'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { ApiError } from '@keimelion/sdk/client'
import { ErrorCode } from '@keimelion/sdk/enums'
import { REPORTS_QUERY_KEY, updateAdminReport } from '@/data-access/reports/reports.api'
import { translate } from '@/lib/i18n/translate'
import { notifyError, notifySuccess } from '@/lib/notify'
import type {
  AdminReportDetailParsed,
  AdminReportsUpdateRequestInput,
} from '@keimelion/sdk/schemas'

export interface UpdateReportVariables {
  id: string
  input: AdminReportsUpdateRequestInput
}

export function useUpdateReport(): UseMutationResult<
  AdminReportDetailParsed,
  Error,
  UpdateReportVariables
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateAdminReport(id, input),
    meta: { silent: true },
    onSuccess: async (report, { input }) => {
      notifySuccess({ title: resolveSuccessTitle(report, input) })
      await queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY })
    },
    onError: async (error) => {
      if (!isReportNotFound(error)) {
        notifyError(error)
        return
      }
      notifyError({ title: translate('reports.mutation.not_found_toast') })
      await queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY })
    },
  })
}

function resolveSuccessTitle(
  report: AdminReportDetailParsed,
  input: AdminReportsUpdateRequestInput,
): string {
  if (input.status === undefined) return translate('reports.mutation.note_saved_toast')
  return translate('reports.mutation.status_updated_toast', {
    status: translate(`reports.status.${report.status}`),
  })
}

function isReportNotFound(error: Error): boolean {
  return error instanceof ApiError && error.code === ErrorCode.REPORT_NOT_FOUND
}
