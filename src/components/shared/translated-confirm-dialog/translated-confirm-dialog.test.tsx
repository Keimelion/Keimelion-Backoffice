import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { TranslatedConfirmDialog } from './translated-confirm-dialog'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TranslatedConfirmDialog', () => {
  it('resolves the four keys from the namespace and interpolates values', () => {
    renderWithIntl(
      <TranslatedConfirmDialog
        open
        onOpenChange={vi.fn()}
        namespace="occasion_types.admin.delete_dialog"
        values={{ label: 'Birthday' }}
        onConfirm={vi.fn()}
        destructive
      />,
    )
    expect(screen.getByText('Delete occasion type')).toBeInTheDocument()
    expect(
      screen.getByText('You are about to permanently delete "Birthday". This action cannot be undone.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No, keep it' })).toBeInTheDocument()
  })

  it('invokes onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    renderWithIntl(
      <TranslatedConfirmDialog
        open
        onOpenChange={vi.fn()}
        namespace="occasion_types.admin.delete_dialog"
        values={{ label: 'Birthday' }}
        onConfirm={onConfirm}
        destructive
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
