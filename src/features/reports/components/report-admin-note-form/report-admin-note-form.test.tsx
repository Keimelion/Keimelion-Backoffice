import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { REPORT_ADMIN_NOTE_MAX_LENGTH } from '@keimelion/sdk/schemas'
import { REPORT_ID, buildReport } from '@/features/reports/reports.test-fixtures'
import { renderWithQueryClient } from '@/test/test-utils'
import { ReportAdminNoteForm } from './report-admin-note-form'

const mutateMock = vi.fn()

vi.mock('@/features/reports/hooks/use-update-report', () => ({
  useUpdateReport: () => ({ mutate: mutateMock, isPending: false }),
}))

function noteField(): HTMLElement {
  return screen.getByLabelText('Admin note')
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Save note' })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ReportAdminNoteForm', () => {
  it('shows the existing note', () => {
    renderWithQueryClient(<ReportAdminNoteForm report={buildReport({ adminNote: 'Checked' })} />)
    expect(noteField()).toHaveValue('Checked')
  })

  it('keeps the save button disabled until the note changes', () => {
    renderWithQueryClient(<ReportAdminNoteForm report={buildReport()} />)
    expect(saveButton()).toBeDisabled()
  })

  it('sends the trimmed note only', async () => {
    renderWithQueryClient(<ReportAdminNoteForm report={buildReport()} />)

    await userEvent.type(noteField(), '  Confirmed spam  ')
    await userEvent.click(saveButton())

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
    })
    expect(mutateMock.mock.calls[0]?.[0]).toEqual({
      id: REPORT_ID,
      input: { adminNote: 'Confirmed spam' },
    })
  })

  it('sends null when an existing note is cleared', async () => {
    renderWithQueryClient(<ReportAdminNoteForm report={buildReport({ adminNote: 'Checked' })} />)

    await userEvent.clear(noteField())
    await userEvent.click(saveButton())

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
    })
    expect(mutateMock.mock.calls[0]?.[0]).toEqual({ id: REPORT_ID, input: { adminNote: null } })
  })

  it('sends null for a whitespace-only note', async () => {
    renderWithQueryClient(<ReportAdminNoteForm report={buildReport()} />)

    await userEvent.type(noteField(), '   ')
    await userEvent.click(saveButton())

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
    })
    expect(mutateMock.mock.calls[0]?.[0]).toEqual({ id: REPORT_ID, input: { adminNote: null } })
  })

  it('shows a validation error and sends nothing above the maximum length', async () => {
    renderWithQueryClient(<ReportAdminNoteForm report={buildReport()} />)

    await userEvent.click(noteField())
    await userEvent.paste('a'.repeat(REPORT_ADMIN_NOTE_MAX_LENGTH + 1))
    await userEvent.click(saveButton())

    expect(
      await screen.findByText(`The note must be ${String(REPORT_ADMIN_NOTE_MAX_LENGTH)} characters or fewer.`),
    ).toBeInTheDocument()
    expect(mutateMock).not.toHaveBeenCalled()
  })
})
