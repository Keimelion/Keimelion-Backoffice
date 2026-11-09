import { describe, expect, it } from 'vitest'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { resolveReportTargetLabel } from '@/features/reports/resolve-report-target-label'
import { buildReport, TARGET_ID } from '@/features/reports/reports.test-fixtures'

function reportFor(
  targetType: AdminReportDetailParsed['targetType'],
  targetSnapshot: Record<string, unknown>,
): AdminReportDetailParsed {
  return buildReport({ targetType, targetSnapshot })
}

describe('resolveReportTargetLabel', () => {
  it('uses the username for a user target', () => {
    expect(resolveReportTargetLabel(reportFor('user', { username: 'alice' }))).toBe('alice')
  })

  it('uses the title for a list target', () => {
    expect(resolveReportTargetLabel(reportFor('list', { title: 'Birthday' }))).toBe('Birthday')
  })

  it('uses the name for an item target', () => {
    expect(resolveReportTargetLabel(reportFor('item', { name: 'Bike' }))).toBe('Bike')
  })

  it('falls back to the target id when the field is missing', () => {
    expect(resolveReportTargetLabel(reportFor('list', {}))).toBe(TARGET_ID)
  })

  it('falls back to the target id when the field has an unexpected type', () => {
    expect(resolveReportTargetLabel(reportFor('item', { name: 42 }))).toBe(TARGET_ID)
  })

  it('falls back to the target id when the field is null', () => {
    expect(resolveReportTargetLabel(reportFor('user', { username: null }))).toBe(TARGET_ID)
  })

  it('falls back to the target id when the field is blank', () => {
    expect(resolveReportTargetLabel(reportFor('list', { title: '   ' }))).toBe(TARGET_ID)
  })
})
