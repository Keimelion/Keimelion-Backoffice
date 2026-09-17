import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { DiscardChangesDialog } from './discard-changes-dialog'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const PROPS = {
  title: 'Discard changes?',
  description: 'You have unsaved changes.',
  discardLabel: 'Discard my changes',
  keepLabel: 'Back to the form',
} as const

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DiscardChangesDialog', () => {
  it('renders the two contextual buttons', () => {
    renderWithIntl(
      <DiscardChangesDialog
        {...PROPS}
        open
        onOpenChange={vi.fn()}
        onDiscard={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Discard my changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to the form' })).toBeInTheDocument()
  })

  it('calls onDiscard and closes when the destructive action is clicked', async () => {
    const onOpenChange = vi.fn()
    const onDiscard = vi.fn()
    renderWithIntl(
      <DiscardChangesDialog
        {...PROPS}
        open
        onOpenChange={onOpenChange}
        onDiscard={onDiscard}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Discard my changes' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onDiscard).toHaveBeenCalledOnce()
  })

  it('does not call onDiscard when the keep button is clicked', async () => {
    const onOpenChange = vi.fn()
    const onDiscard = vi.fn()
    renderWithIntl(
      <DiscardChangesDialog
        {...PROPS}
        open
        onOpenChange={onOpenChange}
        onDiscard={onDiscard}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Back to the form' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onDiscard).not.toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    renderWithIntl(
      <DiscardChangesDialog
        {...PROPS}
        open={false}
        onOpenChange={vi.fn()}
        onDiscard={vi.fn()}
      />,
    )
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument()
  })
})
