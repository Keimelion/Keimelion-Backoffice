import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { ApiError } from '@keimelion/sdk/client'
import { ErrorCode, HttpStatus } from '@keimelion/sdk/enums'
import { toast } from 'sonner'
import { createTestQueryClient } from '@/test/test-utils'
import { REPORT_ID, buildReport } from '@/features/reports/reports.test-fixtures'
import { useUpdateReport } from './use-update-report'

vi.mock('@/data-access/reports/reports.api', () => ({
  REPORTS_QUERY_KEY: ['reports'] as const,
  listAdminReports: vi.fn(),
  updateAdminReport: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import { updateAdminReport } from '@/data-access/reports/reports.api'

function renderUpdateReport(): {
  result: { current: ReturnType<typeof useUpdateReport> }
  invalidateSpy: MockInstance<QueryClient['invalidateQueries']>
} {
  const client = createTestQueryClient()
  const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
  function Wrapper({ children }: { children: ReactNode }): React.JSX.Element {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  const { result } = renderHook(() => useUpdateReport(), { wrapper: Wrapper })
  return { result, invalidateSpy }
}

function buildApiError(code: string, status: number): ApiError {
  return new ApiError({ code, status, message: 'Failure', metadata: {} })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useUpdateReport', () => {
  it('confirms a status change and refreshes the list', async () => {
    vi.mocked(updateAdminReport).mockResolvedValue(buildReport({ status: 'upheld' }))
    const { result, invalidateSpy } = renderUpdateReport()

    result.current.mutate({ id: REPORT_ID, input: { status: 'upheld' } })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateAdminReport).toHaveBeenCalledWith(REPORT_ID, { status: 'upheld' })
    expect(toast.success).toHaveBeenCalledWith('Report marked as Upheld.', expect.anything())
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reports'] })
  })

  it('confirms a note save without mentioning a status', async () => {
    vi.mocked(updateAdminReport).mockResolvedValue(buildReport({ adminNote: 'Checked' }))
    const { result } = renderUpdateReport()

    result.current.mutate({ id: REPORT_ID, input: { adminNote: 'Checked' } })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(toast.success).toHaveBeenCalledWith('Admin note saved.', expect.anything())
  })

  it('shows a targeted toast and refreshes the list on REPORT_NOT_FOUND', async () => {
    vi.mocked(updateAdminReport).mockRejectedValue(
      buildApiError(ErrorCode.REPORT_NOT_FOUND, HttpStatus.NOT_FOUND),
    )
    const { result, invalidateSpy } = renderUpdateReport()

    result.current.mutate({ id: REPORT_ID, input: { status: 'dismissed' } })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(toast.error).toHaveBeenCalledWith(
      'This report no longer exists.',
      expect.anything(),
    )
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reports'] })
  })

  it('shows a generic toast without refreshing on other errors', async () => {
    vi.mocked(updateAdminReport).mockRejectedValue(new Error('Boom'))
    const { result, invalidateSpy } = renderUpdateReport()

    result.current.mutate({ id: REPORT_ID, input: { status: 'dismissed' } })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(toast.error).toHaveBeenCalledWith('Something went wrong', { description: 'Boom' })
    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
