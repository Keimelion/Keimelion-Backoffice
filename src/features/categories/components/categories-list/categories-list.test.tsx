import type { ReactElement } from 'react'
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { CategoriesList } from './categories-list'

function render(ui: ReactElement): void {
  renderWithQueryClient(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/categories',
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

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

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
    slug: name.toLowerCase(),
    depth,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }
}

const ROOT = makeCategory('root-1', null, 'Electronics', 0)
const CHILD = makeCategory('child-1', 'root-1', 'Phones', 1)
const INDEX: ApiCategory[] = [ROOT, CHILD]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CategoriesList', () => {
  it('renders expected column headers and action buttons', async () => {
    vi.mocked(listAdminCategories).mockResolvedValue({
      items: [ROOT, CHILD],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    })
    render(
      <CategoriesList
        categoriesIndex={INDEX}
        onCreateClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )
    const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent)
    expect(headers).toEqual(
      expect.arrayContaining(['Name', 'Slug', 'Parent', 'Depth', 'Created', 'Updated', 'Actions']),
    )
    expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByText('Electronics').length).toBeGreaterThan(0)
    })
  })

  it('renders filter controls', () => {
    vi.mocked(listAdminCategories).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
    render(
      <CategoriesList
        categoriesIndex={INDEX}
        onCreateClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getAllByText('Depth').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Parent').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByPlaceholderText(/search by name or slug/i)).toBeInTheDocument()
  })

  it('shows the empty state label when no categories match', async () => {
    vi.mocked(listAdminCategories).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
    render(
      <CategoriesList
        categoriesIndex={[]}
        onCreateClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText(/no categories match/i)).toBeInTheDocument()
    })
  })

  it('renders the parent name for child categories', async () => {
    vi.mocked(listAdminCategories).mockResolvedValue({
      items: [CHILD],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
    render(
      <CategoriesList
        categoriesIndex={INDEX}
        onCreateClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Phones')).toBeInTheDocument()
    })
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })
})
