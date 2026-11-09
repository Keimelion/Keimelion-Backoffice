import { describe, expect, it, beforeEach } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import { listAdminFeedback, updateAdminFeedback } from './feedback.api'
import { ApiError } from '@keimelion/sdk/client'

const FEEDBACK_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'

const MOCK_USER = {
  id: USER_ID,
  username: 'reporter',
  email: 'reporter@example.com',
}

const MOCK_FEEDBACK = {
  id: FEEDBACK_ID,
  userId: USER_ID,
  title: 'Something is off',
  description: 'The reservation badge is misaligned on mobile.',
  context: { route: '/lists/42' } as Record<string, unknown>,
  status: 'open' as const,
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  user: MOCK_USER,
}

describe('listAdminFeedback', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('sends pagination, filters and sort in the request', async () => {
    mock.onGet('/admin/feedback').reply((config) => {
      expect(config.params).toEqual({
        page: '2',
        limit: '10',
        'title[ilike]': 'badge',
        'userId[eq]': USER_ID,
        'status[eq]': 'open',
        'createdAt[gte]': '2024-01-01T00:00:00.000Z',
        'createdAt[lte]': '2024-12-31T23:59:59.999Z',
        sort: 'createdAt:desc',
      })
      return [
        HttpStatus.OK,
        {
          items: [MOCK_FEEDBACK],
          pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
        },
      ]
    })

    const response = await listAdminFeedback({
      page: 2,
      limit: 10,
      title: 'badge',
      userId: USER_ID,
      status: 'open',
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
      sort: 'createdAt:desc',
    })

    expect(response.items).toHaveLength(1)
  })

  it('omits optional params when not set', async () => {
    mock.onGet('/admin/feedback').reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20' })
      return [
        HttpStatus.OK,
        {
          items: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      ]
    })

    await listAdminFeedback({ page: 1, limit: 20 })
  })

  it('throws ApiError on 403', async () => {
    mock.onGet('/admin/feedback').reply(HttpStatus.FORBIDDEN, {
      code: 'FORBIDDEN',
      message: 'Admin only',
    })
    await expect(listAdminFeedback({ page: 1, limit: 20 })).rejects.toBeInstanceOf(ApiError)
  })
})

describe('updateAdminFeedback', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the updated feedback on success', async () => {
    mock.onPatch(`/admin/feedback/${FEEDBACK_ID}`).reply(HttpStatus.OK, {
      feedback: { ...MOCK_FEEDBACK, status: 'reviewed' },
    })
    const feedback = await updateAdminFeedback(FEEDBACK_ID, { status: 'reviewed' })
    expect(feedback.status).toBe('reviewed')
  })

  it('forwards the status in the patch body', async () => {
    mock.onPatch(`/admin/feedback/${FEEDBACK_ID}`).reply((config) => {
      const parsed = JSON.parse(config.data as string) as { status: string }
      expect(parsed).toEqual({ status: 'closed' })
      return [HttpStatus.OK, { feedback: { ...MOCK_FEEDBACK, status: 'closed' } }]
    })
    await updateAdminFeedback(FEEDBACK_ID, { status: 'closed' })
  })

  it('throws ApiError on 404', async () => {
    mock.onPatch(`/admin/feedback/${FEEDBACK_ID}`).reply(HttpStatus.NOT_FOUND, {
      code: 'FEEDBACK_NOT_FOUND',
      message: 'Not found',
    })
    await expect(
      updateAdminFeedback(FEEDBACK_ID, { status: 'reviewed' }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})
