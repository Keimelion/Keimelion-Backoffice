import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/data-access/occasion-types/admin-occasion-types.api', () => ({
  OCCASION_TYPES_QUERY_KEY: ['occasion-types'] as const,
  deleteOccasionType: vi.fn(),
}))

import { deleteOccasionType } from '@/data-access/occasion-types/admin-occasion-types.api'
import { DeleteOccasionTypeDialog } from './delete-occasion-type-dialog'

const onOpenChange = vi.fn()

function renderDialog(open = true): void {
  renderWithQueryClient(
    <DeleteOccasionTypeDialog
      open={open}
      onOpenChange={onOpenChange}
      occasionTypeId="ot-1"
      label="Birthday"
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DeleteOccasionTypeDialog', () => {
  it('renders the dialog with title and contextual buttons', () => {
    renderDialog()
    expect(screen.getByText('Delete occasion type')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yes, delete Birthday' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No, keep Birthday' })).toBeInTheDocument()
  })

  it('calls deleteOccasionType when the confirm button is clicked', async () => {
    vi.mocked(deleteOccasionType).mockResolvedValue(undefined)
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete Birthday' }))
    await waitFor(() => {
      expect(deleteOccasionType).toHaveBeenCalledWith('ot-1')
    })
  })

  it('does not call deleteOccasionType when the cancel button is clicked', async () => {
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'No, keep Birthday' }))
    expect(deleteOccasionType).not.toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    renderDialog(false)
    expect(screen.queryByText('Delete occasion type')).not.toBeInTheDocument()
  })
})
