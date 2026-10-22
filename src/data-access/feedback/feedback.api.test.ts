import { describe, expect, it, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { axiosInstance } from '@/data-access/_shared/axios'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  apiAdminFeedbackSchema,
  adminFeedbackListResponseSchema,
  listFeedbackQuerySchema,
  updateFeedbackInputSchema,
} from './feedback.schemas'
import { listAdminFeedback, updateAdminFeedback } from './feedback.api'

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

describe('apiAdminFeedbackSchema', () => {
  it('parses a full feedback with context', () => {
    const result = apiAdminFeedbackSchema.safeParse(MOCK_FEEDBACK)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.context).toEqual({ route: '/lists/42' })
  })

  it('accepts a null context', () => {
    const result = apiAdminFeedbackSchema.safeParse({ ...MOCK_FEEDBACK, context: null })
    expect(result.success).toBe(true)
  })

  it('accepts a null user and null userId (anonymous feedback)', () => {
    const result = apiAdminFeedbackSchema.safeParse({
      ...MOCK_FEEDBACK,
      userId: null,
      user: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown status', () => {
    const result = apiAdminFeedbackSchema.safeParse({ ...MOCK_FEEDBACK, status: 'rogue' })
    expect(result.success).toBe(false)
  })
})

describe('adminFeedbackListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = {
      items: [MOCK_FEEDBACK],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const result = adminFeedbackListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })
})

describe('listFeedbackQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listFeedbackQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
    expect(result.data.sort).toBe('createdAt:desc')
  })

  it('accepts a status filter', () => {
    const result = listFeedbackQuerySchema.safeParse({ status: 'reviewed' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown status', () => {
    const result = listFeedbackQuerySchema.safeParse({ status: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('accepts a date range in YYYY-MM-DD format', () => {
    const result = listFeedbackQuerySchema.safeParse({
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a malformed date range value', () => {
    const result = listFeedbackQuerySchema.safeParse({ createdFrom: '01/01/2024' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-UUID userId', () => {
    const result = listFeedbackQuerySchema.safeParse({ userId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('accepts a valid sort', () => {
    const result = listFeedbackQuerySchema.safeParse({ sort: 'createdAt:asc' })
    expect(result.success).toBe(true)
  })

  it('falls back to the default sort when the value is invalid', () => {
    const result = listFeedbackQuerySchema.safeParse({ sort: 'title:asc' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sort).toBe('createdAt:desc')
  })
})

describe('updateFeedbackInputSchema', () => {
  it('accepts a known status', () => {
    const result = updateFeedbackInputSchema.safeParse({ status: 'reviewed' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown field (strict)', () => {
    const result = updateFeedbackInputSchema.safeParse({ status: 'open', title: 'nope' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing status', () => {
    const result = updateFeedbackInputSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('listAdminFeedback', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
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
        currency: 'EUR',
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
      expect(config.params).toEqual({ page: '1', limit: '20', currency: 'EUR' })
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

  it('throws ApiRequestError on 403', async () => {
    mock.onGet('/admin/feedback').reply(HttpStatus.FORBIDDEN, {
      code: 'FORBIDDEN',
      message: 'Admin only',
    })
    await expect(listAdminFeedback({ page: 1, limit: 20 })).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('updateAdminFeedback', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
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

  it('throws ApiRequestError on 404', async () => {
    mock.onPatch(`/admin/feedback/${FEEDBACK_ID}`).reply(HttpStatus.NOT_FOUND, {
      code: 'FEEDBACK_NOT_FOUND',
      message: 'Not found',
    })
    await expect(
      updateAdminFeedback(FEEDBACK_ID, { status: 'reviewed' }),
    ).rejects.toBeInstanceOf(ApiRequestError)
  })
})
