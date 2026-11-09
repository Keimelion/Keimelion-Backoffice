import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { REPORT_ID, buildReport } from '@/features/reports/reports.test-fixtures'
import { renderWithQueryClient } from '@/test/test-utils'
import { ReportStatusActions } from './report-status-actions'

const mutateMock = vi.fn()

vi.mock('@/features/reports/hooks/use-update-report', () => ({
  useUpdateReport: () => ({ mutate: mutateMock, isPending: false }),
}))

function render(ui: ReactElement): void {
  renderWithQueryClient(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ReportStatusActions', () => {
  it('offers uphold and dismiss on a pending report', () => {
    render(<ReportStatusActions report={buildReport()} />)
    expect(screen.getByRole('button', { name: 'Uphold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('offers only dismiss on an upheld report', () => {
    render(<ReportStatusActions report={buildReport({ status: 'upheld' })} />)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Uphold' })).not.toBeInTheDocument()
  })

  it('offers only uphold on a dismissed report', () => {
    render(<ReportStatusActions report={buildReport({ status: 'dismissed' })} />)
    expect(screen.getByRole('button', { name: 'Uphold' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
  })

  it.each(['pending', 'upheld', 'dismissed'] as const)(
    'never offers a move back to pending from %s',
    (status) => {
      render(<ReportStatusActions report={buildReport({ status })} />)
      expect(screen.queryByRole('button', { name: /pending/i })).not.toBeInTheDocument()
    },
  )

  it('sends only the chosen status', async () => {
    render(<ReportStatusActions report={buildReport()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Uphold' }))

    expect(mutateMock).toHaveBeenCalledWith({ id: REPORT_ID, input: { status: 'upheld' } })
  })
})
