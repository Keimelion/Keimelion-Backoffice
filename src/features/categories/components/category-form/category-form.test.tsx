import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { UseFormSetError } from 'react-hook-form'
import { renderWithQueryClient } from '@/test/test-utils'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { CategoryForm } from './category-form'
import type { CategoryFormValues } from './category-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/data-access/categories/categories.api', () => ({
  CATEGORIES_QUERY_KEY: ['categories'] as const,
  listAdminCategories: vi.fn(),
  fetchAdminCategory: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

import { listAdminCategories } from '@/data-access/categories/categories.api'

function makeCategory(
  id: string,
  parentId: string | null,
  name: string,
  depth: number,
): ApiCategory {
  return {
    id,
    parentId,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    depth,
    translations: { en: name, fr: name },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }
}

const ROOT = makeCategory('11111111-1111-1111-1111-111111111111', null, 'Electronics', 0)
const CHILD = makeCategory('22222222-2222-2222-2222-222222222222', ROOT.id, 'Phones', 1)
const DEEP = makeCategory('33333333-3333-3333-3333-333333333333', CHILD.id, 'Smartphones', 2)
const OTHER_ROOT = makeCategory('44444444-4444-4444-4444-444444444444', null, 'Books', 0)

const DEFAULT_LIST = [ROOT, CHILD, DEEP, OTHER_ROOT]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(listAdminCategories).mockResolvedValue(DEFAULT_LIST)
})

describe('CategoryForm (create mode)', () => {
  it('renders a name field per locale plus slug and parent', () => {
    renderWithQueryClient(
      <CategoryForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByLabelText(/name \(english\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name \(français\)/i)).toBeInTheDocument()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Parent category')).toBeInTheDocument()
  })

  it('keeps submit disabled while required fields are missing', () => {
    renderWithQueryClient(
      <CategoryForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('enables submit once both locale names and slug are set', async () => {
    renderWithQueryClient(
      <CategoryForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByLabelText(/name \(english\)/i), 'Phones')
    await userEvent.type(screen.getByLabelText(/name \(français\)/i), 'Téléphones')
    await userEvent.type(screen.getByPlaceholderText('electronics'), 'phones')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
    })
  })

  it('hides depth-2 options from the parent dropdown', async () => {
    renderWithQueryClient(
      <CategoryForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Parent category')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('combobox'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByText('Electronics')).toBeInTheDocument()
    expect(within(listbox).getByText('Phones')).toBeInTheDocument()
    expect(within(listbox).getByText('Books')).toBeInTheDocument()
    expect(within(listbox).queryByText('Smartphones')).not.toBeInTheDocument()
  })

  it('reports dirty state via onDirtyChange as the user types', async () => {
    const onDirtyChange = vi.fn()
    renderWithQueryClient(
      <CategoryForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={onDirtyChange}
        isPending={false}
      />,
    )
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByLabelText(/name \(english\)/i), 'E')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })

  it('surfaces a field-level error on slug via setError (409 pattern)', async () => {
    const onSubmit = vi.fn(
      (_values: CategoryFormValues, setError: UseFormSetError<CategoryFormValues>) => {
        setError('slug', { message: 'This slug is already in use.' })
      },
    )
    renderWithQueryClient(
      <CategoryForm
        mode="create"
        onSubmit={onSubmit}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByLabelText(/name \(english\)/i), 'Phones')
    await userEvent.type(screen.getByLabelText(/name \(français\)/i), 'Téléphones')
    await userEvent.type(screen.getByPlaceholderText('electronics'), 'phones')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('This slug is already in use.')).toBeInTheDocument()
    })
  })
})

describe('CategoryForm (edit mode)', () => {
  it('prefills existing values', () => {
    renderWithQueryClient(
      <CategoryForm
        mode="edit"
        category={CHILD}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByLabelText(/name \(english\)/i)).toHaveValue('Phones')
    expect(screen.getByLabelText(/name \(français\)/i)).toHaveValue('Phones')
    expect(screen.getByDisplayValue('phones')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('excludes self and descendants from the parent dropdown', async () => {
    renderWithQueryClient(
      <CategoryForm
        mode="edit"
        category={ROOT}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await waitFor(() => {
      expect(vi.mocked(listAdminCategories)).toHaveBeenCalled()
    })
    await userEvent.click(screen.getByRole('combobox'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).queryByText('Electronics')).not.toBeInTheDocument()
    expect(within(listbox).queryByText('Phones')).not.toBeInTheDocument()
    expect(within(listbox).queryByText('Smartphones')).not.toBeInTheDocument()
    expect(within(listbox).getByText('Books')).toBeInTheDocument()
  })
})
