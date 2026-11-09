import type { ReactElement } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@keimelion/sdk/client'
import { ErrorCode, HttpStatus } from '@keimelion/sdk/enums'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  REPORTER_ID,
  REVIEWER_ID,
  TARGET_ID,
  buildReport,
} from '@/features/reports/reports.test-fixtures'
import { renderWithQueryClient } from '@/test/test-utils'
import { ReportsList } from './reports-list'

const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock('@/features/reports/hooks/use-admin-reports', () => ({
  buildAdminReportsKey: vi.fn(),
  useAdminReports: vi.fn(),
}))

const statusMutateMock = vi.fn()

vi.mock('@/features/reports/hooks/use-update-report', () => ({
  useUpdateReport: () => ({ mutate: statusMutateMock, isPending: false }),
}))

import { useAdminReports } from '@/features/reports/hooks/use-admin-reports'

type UseAdminReportsReturn = ReturnType<typeof useAdminReports>

function mockReports(
  items: AdminReportDetailParsed[] | null,
  overrides: Partial<UseAdminReportsReturn> = {},
): void {
  const data =
    items === null
      ? undefined
      : { items, pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 } }
  vi.mocked(useAdminReports).mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as UseAdminReportsReturn)
}

function render(ui: ReactElement): void {
  renderWithQueryClient(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

async function expandRow(label: string): Promise<void> {
  await userEvent.click(screen.getByText(label))
}

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

describe('ReportsList', () => {
  it('renders the target, reason, reporter and status columns', () => {
    mockReports([buildReport()])
    render(<ReportsList />)
    expect(screen.getByText('Birthday wishlist')).toBeInTheDocument()
    expect(screen.getByText('List')).toBeInTheDocument()
    expect(screen.getByText('Spam')).toBeInTheDocument()
    expect(screen.getByText('reporter')).toBeInTheDocument()
    expect(screen.getByText(REPORTER_ID)).toBeInTheDocument()
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0)
  })

  it('requests pending reports sorted by most recent when the URL has no filter', () => {
    mockReports([])
    render(<ReportsList />)
    expect(useAdminReports).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending', sort: 'createdAt:desc', page: 1 }),
    )
    expect(screen.getByLabelText('Status')).toHaveTextContent('Pending')
  })

  it('reads the status from the URL', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=all'))
    mockReports([])
    render(<ReportsList />)
    expect(useAdminReports).toHaveBeenCalledWith(expect.objectContaining({ status: 'all' }))
    expect(screen.getByLabelText('Status')).toHaveTextContent('All statuses')
  })

  it('falls back to the target id when the snapshot has no label', () => {
    mockReports([buildReport({ targetSnapshot: { title: 42 } })])
    render(<ReportsList />)
    expect(screen.getByText(TARGET_ID)).toBeInTheDocument()
  })

  it('shows the deleted-account label when the reporter is null', () => {
    mockReports([buildReport({ userId: null, reporter: null })])
    render(<ReportsList />)
    expect(screen.getByText('Deleted account')).toBeInTheDocument()
  })

  it('shows the empty state', () => {
    mockReports([])
    render(<ReportsList />)
    expect(screen.getByText('No reports match these filters.')).toBeInTheDocument()
  })

  it('shows a loading skeleton instead of the empty state', () => {
    mockReports(null, { isLoading: true })
    render(<ReportsList />)
    expect(screen.queryByText('No reports match these filters.')).not.toBeInTheDocument()
  })

  it('shows a retry button on error', () => {
    mockReports(null, { isError: true, error: new Error('Boom') })
    render(<ReportsList />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    expect(screen.getByText('Boom')).toBeInTheDocument()
  })

  it('shows the forbidden state on 403', () => {
    mockReports(null, {
      isError: true,
      error: new ApiError({
        code: ErrorCode.FORBIDDEN,
        status: HttpStatus.FORBIDDEN,
        message: 'Admin only',
        metadata: {},
      }),
    })
    render(<ReportsList />)
    expect(screen.getByText('Access restricted')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })

  it('does not mount details or the note form while a row is collapsed', () => {
    mockReports([buildReport()])
    render(<ReportsList />)
    expect(screen.queryByLabelText('Admin note')).not.toBeInTheDocument()
    expect(screen.queryByText('This list is an advertisement.')).not.toBeInTheDocument()
  })

  it('shows the details and note form once a row is expanded', async () => {
    mockReports([buildReport({ adminNote: 'Looks legit' })])
    render(<ReportsList />)

    await expandRow('Birthday wishlist')

    expect(await screen.findByText('This list is an advertisement.')).toBeInTheDocument()
    expect(screen.getByText(TARGET_ID)).toBeInTheDocument()
    expect(screen.getByText(/"title": "Birthday wishlist"/)).toBeInTheDocument()
    expect(screen.getByLabelText('Admin note')).toHaveValue('Looks legit')
    expect(screen.queryByText(/Reviewed on/)).not.toBeInTheDocument()
  })

  it('shows the empty description state and the review metadata', async () => {
    mockReports([
      buildReport({
        description: null,
        status: 'upheld',
        reviewedAt: new Date('2024-03-01T00:00:00.000Z'),
        reviewedByUserId: REVIEWER_ID,
      }),
    ])
    render(<ReportsList />)

    await expandRow('Birthday wishlist')

    expect(await screen.findByText('No description provided.')).toBeInTheDocument()
    expect(screen.getByText('Reviewed on 01/03/2024')).toBeInTheDocument()
    expect(screen.getByText(REVIEWER_ID)).toBeInTheDocument()
  })

  it('does not toggle the row when clicking a review action', async () => {
    mockReports([buildReport()])
    render(<ReportsList />)

    await userEvent.click(screen.getByRole('button', { name: 'Uphold' }))

    expect(statusMutateMock).toHaveBeenCalledTimes(1)
    expect(screen.queryByLabelText('Admin note')).not.toBeInTheDocument()
  })

  it('keeps the row open when interacting with the note form', async () => {
    mockReports([buildReport()])
    render(<ReportsList />)
    await expandRow('Birthday wishlist')
    const noteField = await screen.findByLabelText('Admin note')

    await userEvent.click(noteField)
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Admin note')).toBeInTheDocument()
    })
  })
})
