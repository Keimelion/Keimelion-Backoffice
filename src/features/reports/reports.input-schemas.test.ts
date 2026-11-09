import { describe, expect, it } from 'vitest'
import { REPORT_ADMIN_NOTE_MAX_LENGTH } from '@keimelion/sdk/schemas'
import {
  listReportsQuerySchema,
  reportAdminNoteFormSchema,
} from '@/features/reports/reports.input-schemas'

describe('listReportsQuerySchema', () => {
  it('defaults to pending reports sorted by most recent', () => {
    const parsed = listReportsQuerySchema.parse({})
    expect(parsed.status).toBe('pending')
    expect(parsed.sort).toBe('createdAt:desc')
    expect(parsed.page).toBe(1)
  })

  it('falls back to pending for an unknown status', () => {
    expect(listReportsQuerySchema.parse({ status: 'archived' }).status).toBe('pending')
  })

  it('accepts the all-statuses sentinel', () => {
    expect(listReportsQuerySchema.parse({ status: 'all' }).status).toBe('all')
  })

  it('rejects an unknown reason', () => {
    expect(listReportsQuerySchema.safeParse({ reason: 'boredom' }).success).toBe(false)
  })

  it('rejects a malformed date', () => {
    expect(listReportsQuerySchema.safeParse({ createdFrom: '01/01/2024' }).success).toBe(false)
  })
})

describe('reportAdminNoteFormSchema', () => {
  it('trims the note', () => {
    expect(reportAdminNoteFormSchema.parse({ adminNote: '  checked  ' }).adminNote).toBe('checked')
  })

  it('reduces a whitespace-only note to an empty string', () => {
    expect(reportAdminNoteFormSchema.parse({ adminNote: ' \n\t ' }).adminNote).toBe('')
  })

  it('accepts a note at the maximum length', () => {
    const adminNote = 'a'.repeat(REPORT_ADMIN_NOTE_MAX_LENGTH)
    expect(reportAdminNoteFormSchema.safeParse({ adminNote }).success).toBe(true)
  })

  it('rejects a note above the maximum length', () => {
    const adminNote = 'a'.repeat(REPORT_ADMIN_NOTE_MAX_LENGTH + 1)
    expect(reportAdminNoteFormSchema.safeParse({ adminNote }).success).toBe(false)
  })
})
