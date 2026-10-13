import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { DeleteCategoryDialog } from './delete-category-dialog'

const deleteCategoryMock = vi.fn((_id: string): Promise<void> => Promise.resolve())

vi.mock('@/data-access/categories/categories.api', () => ({
  CATEGORIES_QUERY_KEY: ['categories'] as const,
  listAdminCategories: vi.fn(),
  fetchAdminCategory: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: (id: string) => deleteCategoryMock(id),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const MOCK_CATEGORY = {
  id: '11111111-1111-1111-1111-111111111111',
  parentId: null,
  name: 'Electronics',
  slug: 'electronics',
  depth: 0,
  translations: { en: 'Electronics' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  deleteCategoryMock.mockClear()
})

describe('DeleteCategoryDialog', () => {
  it('shows the cascade warning when the category has descendants', () => {
    renderWithQueryClient(
      <DeleteCategoryDialog
        open
        onOpenChange={vi.fn()}
        category={MOCK_CATEGORY}
        descendantCount={3}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/3 child categor/i)
  })

  it('does not show the cascade warning when there are no descendants', () => {
    renderWithQueryClient(
      <DeleteCategoryDialog
        open
        onOpenChange={vi.fn()}
        category={MOCK_CATEGORY}
        descendantCount={0}
      />,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('calls deleteCategory when the confirm button is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithQueryClient(
      <DeleteCategoryDialog
        open
        onOpenChange={onOpenChange}
        category={MOCK_CATEGORY}
        descendantCount={0}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /yes, delete category/i }))
    await waitFor(() => {
      expect(deleteCategoryMock).toHaveBeenCalledWith(MOCK_CATEGORY.id)
    })
  })

  it('does not call deleteCategory when the cancel button is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithQueryClient(
      <DeleteCategoryDialog
        open
        onOpenChange={onOpenChange}
        category={MOCK_CATEGORY}
        descendantCount={2}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /no, keep category/i }))
    expect(deleteCategoryMock).not.toHaveBeenCalled()
  })
})
