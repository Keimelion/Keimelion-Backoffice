import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { buildReport } from '@/features/reports/reports.test-fixtures'
import { renderWithIntl } from '@/test/test-utils'
import { ReportTargetSnapshot } from './report-target-snapshot'

const report = buildReport({
  targetType: 'list',
  targetSnapshot: { title: 'Birthday', owner: { username: 'alice' }, listStatus: 'active' },
})

describe('ReportTargetSnapshot', () => {
  it('shows the readable preview by default', () => {
    renderWithIntl(<ReportTargetSnapshot report={report} />)
    expect(screen.getByText('Birthday')).toBeInTheDocument()
    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByText(/"listStatus"/)).not.toBeInTheDocument()
  })

  it('switches to the raw JSON and unmounts the preview', async () => {
    renderWithIntl(<ReportTargetSnapshot report={report} />)
    await userEvent.click(screen.getByRole('button', { name: 'JSON' }))
    expect(screen.getByText(/"listStatus": "active"/)).toBeInTheDocument()
    expect(screen.queryByText('Owner')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'JSON' })).toHaveAttribute('aria-pressed', 'true')
  })
})
