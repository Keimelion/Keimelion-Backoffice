import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { FormDialog } from './form-dialog'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FormDialog', () => {
  it('renders the title and children when open', () => {
    renderWithIntl(
      <FormDialog open onOpenChange={vi.fn()} title="Create X" isFormDirty={false}>
        <p>form content</p>
      </FormDialog>,
    )
    expect(screen.getByText('Create X')).toBeInTheDocument()
    expect(screen.getByText('form content')).toBeInTheDocument()
  })

  it('closes directly (no guard) when the form is not dirty', async () => {
    const onOpenChange = vi.fn()
    renderWithIntl(
      <FormDialog open onOpenChange={onOpenChange} title="Create X" isFormDirty={false}>
        <p>form</p>
      </FormDialog>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('opens the discard-changes dialog when closing a dirty form', async () => {
    const onOpenChange = vi.fn()
    renderWithIntl(
      <FormDialog open onOpenChange={onOpenChange} title="Create X" isFormDirty>
        <p>form</p>
      </FormDialog>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByText('Discard changes?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Discard my changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to the form' })).toBeInTheDocument()
  })

  it('closes both dialogs when the user confirms the discard', async () => {
    const onOpenChange = vi.fn()
    renderWithIntl(
      <FormDialog open onOpenChange={onOpenChange} title="Create X" isFormDirty>
        <p>form</p>
      </FormDialog>,
    )
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Discard my changes' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps the form open when the user chooses "Back to the form"', async () => {
    const onOpenChange = vi.fn()
    renderWithIntl(
      <FormDialog open onOpenChange={onOpenChange} title="Create X" isFormDirty>
        <p>form</p>
      </FormDialog>,
    )
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Back to the form' }))
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
