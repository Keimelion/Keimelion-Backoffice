import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { renderWithQueryClient } from '@/test/test-utils'
import { FeedbackStatusActions } from './feedback-status-actions'

const mutateMock = vi.fn()

vi.mock('@/features/feedback/hooks/use-update-feedback-status', () => ({
  useUpdateFeedbackStatus: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const FEEDBACK_ID = '11111111-1111-4111-8111-111111111111'

const BASE_FEEDBACK = {
  id: FEEDBACK_ID,
  userId: null,
  title: 'Reservation badge misaligned',
  description: 'The reservation badge is misaligned on mobile.',
  context: null,
  status: 'open' as const,
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  user: null,
}

function render(ui: ReactElement): void {
  renderWithQueryClient(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FeedbackStatusActions', () => {
  it('renders an icon button for every status except the current one', () => {
    render(<FeedbackStatusActions feedback={BASE_FEEDBACK} />)
    expect(screen.getByRole('button', { name: 'Mark as reviewed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as closed' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as open' })).not.toBeInTheDocument()
  })

  it('calls the mutation with the next status when the user clicks the reviewed icon', async () => {
    render(<FeedbackStatusActions feedback={BASE_FEEDBACK} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mark as reviewed' }))

    expect(mutateMock).toHaveBeenCalledTimes(1)
    expect(mutateMock.mock.calls[0]?.[0]).toEqual({
      id: FEEDBACK_ID,
      status: 'reviewed',
    })
  })

  it('offers the reopen action when the feedback is already closed', () => {
    render(<FeedbackStatusActions feedback={{ ...BASE_FEEDBACK, status: 'closed' }} />)
    expect(screen.getByRole('button', { name: 'Mark as open' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as reviewed' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as closed' })).not.toBeInTheDocument()
  })
})
