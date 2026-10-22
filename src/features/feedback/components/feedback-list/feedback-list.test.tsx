import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ApiAdminFeedback } from '@/data-access/feedback/feedback.schemas'
import { renderWithQueryClient } from '@/test/test-utils'
import { FeedbackList } from './feedback-list'

const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/features/feedback/hooks/use-admin-feedback', () => ({
  buildAdminFeedbackKey: vi.fn(),
  useAdminFeedback: vi.fn(),
}))

vi.mock('@/features/feedback/hooks/use-update-feedback-status', () => ({
  useUpdateFeedbackStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

import { useAdminFeedback } from '@/features/feedback/hooks/use-admin-feedback'

type UseAdminFeedbackReturn = ReturnType<typeof useAdminFeedback>

const FEEDBACK_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'

const BASE_FEEDBACK: ApiAdminFeedback = {
  id: FEEDBACK_ID,
  userId: USER_ID,
  title: 'Reservation badge misaligned',
  description:
    'The reservation badge is misaligned on mobile when the list has more than ten items with reservations.',
  context: { route: '/lists/42' },
  status: 'open',
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  user: {
    id: USER_ID,
    username: 'reporter',
    email: 'reporter@example.com',
  },
}

function mockFeedbackResult(data: ApiAdminFeedback[] | null, overrides: Partial<UseAdminFeedbackReturn> = {}): void {
  const response =
    data === null
      ? undefined
      : {
          items: data,
          pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 },
        }
  vi.mocked(useAdminFeedback).mockReturnValue({
    data: response,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as UseAdminFeedbackReturn)
}

function render(ui: ReactElement): void {
  renderWithQueryClient(ui)
}

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

describe('FeedbackList', () => {
  it('renders feedback title, description preview and status badge', () => {
    mockFeedbackResult([BASE_FEEDBACK])
    render(<FeedbackList />)
    expect(screen.getByText('Reservation badge misaligned')).toBeInTheDocument()
    expect(screen.getByText(/misaligned on mobile/)).toBeInTheDocument()
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0)
  })

  it('renders the user block when the feedback has an author', () => {
    mockFeedbackResult([BASE_FEEDBACK])
    render(<FeedbackList />)
    expect(screen.getByText('reporter')).toBeInTheDocument()
    expect(screen.getByText(USER_ID)).toBeInTheDocument()
  })

  it('renders the anonymous placeholder when userId is null', () => {
    mockFeedbackResult([{ ...BASE_FEEDBACK, userId: null, user: null }])
    render(<FeedbackList />)
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
  })

  it('shows the empty state when there are no feedback entries', () => {
    mockFeedbackResult([])
    render(<FeedbackList />)
    expect(screen.getByText('No feedback matches these filters.')).toBeInTheDocument()
  })

  it('renders the title, user id, status and date range filters', () => {
    mockFeedbackResult([])
    render(<FeedbackList />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('User ID')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reviewed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Closed' })).toBeInTheDocument()
    expect(screen.getByLabelText('Created from')).toBeInTheDocument()
    expect(screen.getByLabelText('Created to')).toBeInTheDocument()
  })

  it('renders a retry button on error', () => {
    mockFeedbackResult(null, {
      isError: true,
      error: new Error('Boom'),
    })
    render(<FeedbackList />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    expect(screen.getByText('Boom')).toBeInTheDocument()
  })

  it('shows the per-row status actions trigger with the feedback title in the aria label', () => {
    mockFeedbackResult([BASE_FEEDBACK])
    render(<FeedbackList />)
    expect(
      screen.getByRole('button', { name: /change status for reservation badge misaligned/i }),
    ).toBeInTheDocument()
  })
})
