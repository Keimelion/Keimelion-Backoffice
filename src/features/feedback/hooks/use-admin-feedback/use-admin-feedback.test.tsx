import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { buildAdminFeedbackKey, useAdminFeedback } from './use-admin-feedback'

vi.mock('@/data-access/feedback/feedback.api', () => ({
  FEEDBACK_QUERY_KEY: ['feedback'] as const,
  listAdminFeedback: vi.fn(),
  updateAdminFeedback: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import { listAdminFeedback } from '@/data-access/feedback/feedback.api'

const FEEDBACK_ID = '11111111-1111-4111-8111-111111111111'

const MOCK_FEEDBACK = {
  id: FEEDBACK_ID,
  userId: null,
  title: 'Something is off',
  description: 'The reservation badge is misaligned on mobile.',
  context: null,
  status: 'open' as const,
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  user: null,
}

const MOCK_RESPONSE = {
  items: [MOCK_FEEDBACK],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildAdminFeedbackKey', () => {
  it('produces the expected key shape', () => {
    const key = buildAdminFeedbackKey({ page: 1, limit: 20 })
    expect(key[0]).toBe('feedback')
    expect(key[1]).toBe('list')
    expect(key[2]).toMatchObject({ page: 1, limit: 20 })
  })

  it('strips undefined and empty values from the normalized filters', () => {
    const key = buildAdminFeedbackKey({ page: 1, title: undefined })
    expect('title' in key[2]).toBe(false)
  })

  it('sorts filter keys for cache stability', () => {
    const keyA = buildAdminFeedbackKey({ page: 1, title: 'a', limit: 20 })
    const keyB = buildAdminFeedbackKey({ limit: 20, title: 'a', page: 1 })
    expect(JSON.stringify(keyA[2])).toBe(JSON.stringify(keyB[2]))
  })
})

describe('useAdminFeedback', () => {
  it('returns data on successful fetch', async () => {
    vi.mocked(listAdminFeedback).mockResolvedValue(MOCK_RESPONSE)
    const { result } = renderHook(() => useAdminFeedback({ page: 1, limit: 20 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items[0]?.title).toBe('Something is off')
    expect(listAdminFeedback).toHaveBeenCalledWith({ page: 1, limit: 20 })
  })

  it('exposes isError on failure', async () => {
    vi.mocked(listAdminFeedback).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useAdminFeedback({ page: 1 }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('is disabled and does not call fetch when enabled is false', async () => {
    const { result } = renderHook(() => useAdminFeedback({ page: 1 }, { enabled: false }), {
      wrapper: createQueryClientWrapper(),
    })
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
    expect(listAdminFeedback).not.toHaveBeenCalled()
  })
})
