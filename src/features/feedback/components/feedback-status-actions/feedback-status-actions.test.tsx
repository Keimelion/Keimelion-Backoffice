import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
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
  renderWithQueryClient(ui)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FeedbackStatusActions', () => {
  it('exposes a trigger labeled with the feedback title', () => {
    render(<FeedbackStatusActions feedback={BASE_FEEDBACK} />)
    expect(
      screen.getByRole('button', { name: /change status for reservation badge misaligned/i }),
    ).toBeInTheDocument()
  })

  it('calls the mutation with the next status when the user picks reviewed', async () => {
    render(<FeedbackStatusActions feedback={BASE_FEEDBACK} />)
    await userEvent.click(
      screen.getByRole('button', { name: /change status for reservation badge misaligned/i }),
    )
    await userEvent.click(screen.getByRole('menuitem', { name: /mark as reviewed/i }))

    expect(mutateMock).toHaveBeenCalledTimes(1)
    expect(mutateMock.mock.calls[0]?.[0]).toEqual({
      id: FEEDBACK_ID,
      status: 'reviewed',
    })
  })

  it('does not fire the mutation when the user re-selects the current status', async () => {
    render(<FeedbackStatusActions feedback={BASE_FEEDBACK} />)
    await userEvent.click(
      screen.getByRole('button', { name: /change status for reservation badge misaligned/i }),
    )
    const openItem = screen.getByRole('menuitem', { name: /mark as open/i })
    expect(openItem).toHaveAttribute('aria-disabled', 'true')
  })
})
