import type { ReactElement } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseFormSetError } from 'react-hook-form'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ListForm } from './list-form'
import type { ListFormEditValues } from './list-form'

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

vi.mock('@/features/tags/hooks/use-admin-tags', () => ({
  useAdminTags: () => ({
    data: {
      items: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
    },
    isLoading: false,
    isError: false,
  }),
}))

const OCCASION_TYPE_BIRTHDAY_ID = '55555555-5555-4555-8555-555555555555'

vi.mock('@/features/occasion-types/hooks/use-occasion-types', () => ({
  useOccasionTypes: () => ({
    data: [
      { id: '55555555-5555-4555-8555-555555555555', slug: 'birthday', label: 'Birthday', emoji: '🎂' },
      { id: '66666666-6666-4666-8666-666666666666', slug: 'wedding', label: 'Wedding', emoji: '💍' },
    ],
    isLoading: false,
    isError: false,
  }),
}))

const MOCK_LIST = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Birthday wishlist',
  slug: 'birthday-wishlist',
  description: 'For my birthday',
  listStatus: 'active' as const,
  occasionTypeId: OCCASION_TYPE_BIRTHDAY_ID,
  owner: null,
  tags: [{ id: 't-1', name: 'family', slug: 'family' }],
  itemCount: 2,
  totalEstimatedPrice: '42.00',
  displayCurrency: 'EUR' as const,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ListForm (edit mode)', () => {
  it('prefills title and description with existing values', () => {
    render(
      <ListForm
        mode="edit"
        list={MOCK_LIST}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByDisplayValue('Birthday wishlist')).toBeInTheDocument()
    expect(screen.getByDisplayValue('For my birthday')).toBeInTheDocument()
  })

  it('reports dirty state once the user edits the title', async () => {
    const onDirtyChange = vi.fn()
    render(
      <ListForm
        mode="edit"
        list={MOCK_LIST}
        onSubmit={vi.fn()}
        onDirtyChange={onDirtyChange}
        isPending={false}
      />,
    )
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByDisplayValue('Birthday wishlist'), '!')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })

  it('prefills the existing tag chip from the list', () => {
    render(
      <ListForm
        mode="edit"
        list={MOCK_LIST}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByText('family')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /remove tag family/i }),
    ).toBeInTheDocument()
  })

  it('submits the updated title when save is clicked', async () => {
    const onSubmit = vi.fn()
    render(
      <ListForm
        mode="edit"
        list={MOCK_LIST}
        onSubmit={onSubmit}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    const titleInput = screen.getByDisplayValue('Birthday wishlist')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Renamed')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    const payload = onSubmit.mock.calls[0]?.[0] as { title?: string }
    expect(payload.title).toBe('Renamed')
  })

  it('surfaces an inline validation error via setError (422 mapping)', async () => {
    const onSubmit = vi.fn((
      _values: ListFormEditValues,
      setError: UseFormSetError<ListFormEditValues>,
    ) => {
      setError('title', { message: 'A list with this title already exists.' })
    })
    render(
      <ListForm
        mode="edit"
        list={MOCK_LIST}
        onSubmit={onSubmit}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    const titleInput = screen.getByDisplayValue('Birthday wishlist')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Renamed')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    expect(screen.getByText('A list with this title already exists.')).toBeInTheDocument()
  })

  it('keeps the submit button disabled while nothing is dirty', () => {
    render(
      <ListForm
        mode="edit"
        list={MOCK_LIST}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })
})
