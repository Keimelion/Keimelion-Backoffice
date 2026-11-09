import { beforeEach, describe, expect, it } from 'vitest'
import { ApiError } from '@keimelion/sdk/client'
import { ErrorCode, HttpStatus } from '@keimelion/sdk/enums'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { listAdminReports, updateAdminReport } from './reports.api'

const REPORT_ID = '11111111-1111-4111-8111-111111111111'
const TARGET_ID = '22222222-2222-4222-8222-222222222222'

const MOCK_REPORT = {
  id: REPORT_ID,
  userId: null,
  targetType: 'list',
  targetId: TARGET_ID,
  reason: 'spam',
  description: null,
  status: 'pending',
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  reporter: null,
  targetSnapshot: { title: 'Birthday' },
  targetImageId: null,
  adminNote: null,
  reviewedByUserId: null,
  reviewedAt: null,
}

describe('listAdminReports', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('sends pagination, bracket filters and sort in the request', async () => {
    mock.onGet('/admin/reports').reply((config) => {
      expect(config.params).toEqual({
        page: '2',
        limit: '10',
        sort: 'createdAt:desc',
        'status[eq]': 'pending',
        'targetType[eq]': 'list',
        'reason[eq]': 'spam',
        'createdAt[gte]': '2024-01-01T00:00:00.000Z',
        'createdAt[lte]': '2024-12-31T23:59:59.999Z',
      })
      return [
        HttpStatus.OK,
        { items: [MOCK_REPORT], pagination: { page: 2, limit: 10, total: 1, totalPages: 1 } },
      ]
    })

    const response = await listAdminReports({
      page: 2,
      limit: 10,
      sort: 'createdAt:desc',
      status: 'pending',
      targetType: 'list',
      reason: 'spam',
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
    })

    expect(response.items).toHaveLength(1)
  })

  it('omits optional filters when not set', async () => {
    mock.onGet('/admin/reports').reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20' })
      return [
        HttpStatus.OK,
        { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      ]
    })

    await listAdminReports({ page: 1, limit: 20 })
  })

  it('throws ApiError on 403', async () => {
    mock.onGet('/admin/reports').reply(HttpStatus.FORBIDDEN, {
      code: ErrorCode.FORBIDDEN,
      message: 'Admin only',
    })

    await expect(listAdminReports({ page: 1 })).rejects.toBeInstanceOf(ApiError)
  })
})

describe('updateAdminReport', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('sends only the status when reviewing and returns the updated report', async () => {
    mock.onPatch(`/admin/reports/${REPORT_ID}`).reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ status: 'upheld' })
      return [HttpStatus.OK, { report: { ...MOCK_REPORT, status: 'upheld' } }]
    })

    const report = await updateAdminReport(REPORT_ID, { status: 'upheld' })

    expect(report.status).toBe('upheld')
  })

  it('sends only the admin note when saving a note', async () => {
    mock.onPatch(`/admin/reports/${REPORT_ID}`).reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ adminNote: null })
      return [HttpStatus.OK, { report: MOCK_REPORT }]
    })

    await updateAdminReport(REPORT_ID, { adminNote: null })
  })

  it('exposes the REPORT_NOT_FOUND code on 404', async () => {
    mock.onPatch(`/admin/reports/${REPORT_ID}`).reply(HttpStatus.NOT_FOUND, {
      code: ErrorCode.REPORT_NOT_FOUND,
      message: 'Report not found',
      metadata: {},
    })

    await expect(updateAdminReport(REPORT_ID, { status: 'dismissed' })).rejects.toMatchObject({
      code: ErrorCode.REPORT_NOT_FOUND,
    })
  })
})
