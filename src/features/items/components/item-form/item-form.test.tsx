import type { ReactElement } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ItemForm } from './item-form'

function render(ui: ReactElement): void {
  renderWithQueryClient(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/features/shops/hooks/use-admin-shops', () => ({
  useAdminShops: () => ({ data: { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } }, isLoading: false }),
}))

const MOCK_ITEM = {
  id: 'item-1',
  name: 'Blanket',
  description: 'Warm',
  imageUrl: null,
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  sources: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ItemForm (create mode)', () => {
  it('renders name, description, image URL and one source row by default', () => {
    render(
      <ItemForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Image URL')).toBeInTheDocument()
    expect(screen.getByText('Sources')).toBeInTheDocument()
    expect(screen.getByText('Source 1')).toBeInTheDocument()
  })

  it('appends a new source row when the Add source button is clicked', async () => {
    render(
      <ItemForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /add source/i }))
    expect(screen.getByText('Source 2')).toBeInTheDocument()
  })

  it('disables the remove button when only one source remains', () => {
    render(
      <ItemForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    const removeButton = screen.getByRole('button', { name: /at least one source is required/i })
    expect(removeButton).toBeDisabled()
  })

  it('allows removing additional sources, keeping the first row enabled only when more exist', async () => {
    render(
      <ItemForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /add source/i }))
    const removeButtons = screen.getAllByRole('button', { name: /remove source/i })
    const firstRemoveButton = removeButtons[0]
    if (firstRemoveButton === undefined) throw new Error('Expected a remove button')
    expect(firstRemoveButton).toBeEnabled()
    await userEvent.click(firstRemoveButton)
    expect(screen.queryByText('Source 2')).not.toBeInTheDocument()
  })

  it('keeps the submit button disabled until name and a source are filled', () => {
    render(
      <ItemForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('button', { name: /^create$/i })).toBeDisabled()
  })
})

describe('ItemForm (edit mode)', () => {
  it('does not render the sources section', () => {
    render(
      <ItemForm
        mode="edit"
        item={MOCK_ITEM}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.queryByText('Sources')).not.toBeInTheDocument()
    expect(screen.queryByText('Source 1')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add source/i })).not.toBeInTheDocument()
  })

  it('prefills name and description with existing values', () => {
    render(
      <ItemForm
        mode="edit"
        item={MOCK_ITEM}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByDisplayValue('Blanket')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Warm')).toBeInTheDocument()
  })

  it('reports dirty state once the user edits name', async () => {
    const onDirtyChange = vi.fn()
    render(
      <ItemForm
        mode="edit"
        item={MOCK_ITEM}
        onSubmit={vi.fn()}
        onDirtyChange={onDirtyChange}
        isPending={false}
      />,
    )
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByDisplayValue('Blanket'), '!')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })
})
