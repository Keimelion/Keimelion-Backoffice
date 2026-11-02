import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useUpdateFeedbackStatus } from './use-update-feedback-status'

vi.mock('@/data-access/feedback/feedback.api', () => ({
  FEEDBACK_QUERY_KEY: ['feedback'] as const,
  listAdminFeedback: vi.fn(),
  updateAdminFeedback: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

import { updateAdminFeedback } from '@/data-access/feedback/feedback.api'

const FEEDBACK_ID = '11111111-1111-4111-8111-111111111111'

const MOCK_FEEDBACK = {
  id: FEEDBACK_ID,
  userId: null,
  title: 'Something is off',
  description: 'The reservation badge is misaligned on mobile.',
  context: null,
  status: 'reviewed' as const,
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  user: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useUpdateFeedbackStatus', () => {
  it('calls updateAdminFeedback with the given id and status', async () => {
    vi.mocked(updateAdminFeedback).mockResolvedValue(MOCK_FEEDBACK)
    const { result } = renderHook(() => useUpdateFeedbackStatus(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ id: FEEDBACK_ID, status: 'reviewed' })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(updateAdminFeedback).toHaveBeenCalledWith(FEEDBACK_ID, { status: 'reviewed' })
  })

  it('surfaces the error on failure without crashing', async () => {
    vi.mocked(updateAdminFeedback).mockRejectedValue(new Error('Boom'))
    const { result } = renderHook(() => useUpdateFeedbackStatus(), {
      wrapper: createQueryClientWrapper(),
    })
    result.current.mutate({ id: FEEDBACK_ID, status: 'closed' })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
