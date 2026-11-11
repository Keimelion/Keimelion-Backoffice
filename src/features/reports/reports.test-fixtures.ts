import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'

export const REPORT_ID = '11111111-1111-4111-8111-111111111111'
export const TARGET_ID = '22222222-2222-4222-8222-222222222222'
export const REPORTER_ID = '33333333-3333-4333-8333-333333333333'
export const REVIEWER_ID = '44444444-4444-4444-8444-444444444444'

export function buildReport(overrides: Partial<AdminReportDetailParsed> = {}): AdminReportDetailParsed {
  return {
    id: REPORT_ID,
    userId: REPORTER_ID,
    targetType: 'list',
    targetId: TARGET_ID,
    reason: 'spam',
    description: 'This list is an advertisement.',
    status: 'pending',
    createdAt: new Date('2024-02-01T00:00:00.000Z'),
    updatedAt: new Date('2024-02-01T00:00:00.000Z'),
    reporter: { id: REPORTER_ID, username: 'reporter' },
    targetSnapshot: { title: 'Birthday wishlist' },
    targetImageId: null,
    adminNote: null,
    reviewedByUserId: null,
    reviewedAt: null,
    ...overrides,
  }
}
