import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { buildReport } from '@/features/reports/reports.test-fixtures'
import { buildAdminReportsKey, useAdminReports } from './use-admin-reports'

vi.mock('@/data-access/reports/reports.api', () => ({
  REPORTS_QUERY_KEY: ['reports'] as const,
  listAdminReports: vi.fn(),
  updateAdminReport: vi.fn(),
}))

import { listAdminReports } from '@/data-access/reports/reports.api'

const MOCK_RESPONSE = {
  items: [buildReport()],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminReportsKey', () => {
  it('keys the list under the reports namespace', () => {
    const key = buildAdminReportsKey({ page: 1, status: 'pending' })
    expect(key[0]).toBe('reports')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ page: 1, status: 'pending' })
  })
})

describe('useAdminReports', () => {
  it('forwards the status filter', async () => {
    vi.mocked(listAdminReports).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminReports({ page: 1, status: 'upheld' }), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(listAdminReports).toHaveBeenCalledWith({ page: 1, status: 'upheld' })
  })

  it('removes the status filter for the all-statuses sentinel', async () => {
    vi.mocked(listAdminReports).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminReports({ page: 1, status: 'all' }), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(listAdminReports).toHaveBeenCalledWith({ page: 1, status: undefined })
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminReports).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminReports({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
