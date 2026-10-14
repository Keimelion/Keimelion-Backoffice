import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { CategoriesPicker } from './categories-picker'

const CATEGORY_FOOD = {
  id: '11111111-1111-4111-8111-111111111111',
  parentId: null,
  translations: { en: 'Food', fr: 'Alimentation' },
  slug: 'food',
  depth: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}
const DESSERTS_PARENT_ID = CATEGORY_FOOD.id
const CATEGORY_DESSERTS = {
  id: '22222222-2222-4222-8222-222222222222',
  parentId: DESSERTS_PARENT_ID,
  translations: { en: 'Desserts', fr: 'Desserts' },
  slug: 'desserts',
  depth: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}
const CATEGORY_FASHION = {
  id: '33333333-3333-4333-8333-333333333333',
  parentId: null,
  translations: { en: 'Fashion', fr: 'Mode' },
  slug: 'fashion',
  depth: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

interface MockQueryResult {
  data: unknown
  isLoading: boolean
  isError: boolean
}

const useAdminCategoriesMock = vi.fn<() => MockQueryResult>()

vi.mock('@/features/categories/hooks/use-admin-categories', () => ({
  useAdminCategories: (): MockQueryResult => useAdminCategoriesMock(),
}))

function render(ui: ReactElement): void {
  renderWithQueryClient(ui)
}

describe('CategoriesPicker', () => {
  it('shows a skeleton while categories are loading', () => {
    useAdminCategoriesMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    render(<CategoriesPicker value={[]} onChange={vi.fn()} disabled={false} max={2} />)
    expect(screen.getByText(/loading categories/i)).toBeInTheDocument()
  })

  it('shows an error state when the categories query fails', () => {
    useAdminCategoriesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    render(<CategoriesPicker value={[]} onChange={vi.fn()} disabled={false} max={2} />)
    expect(screen.getByText(/failed to load categories/i)).toBeInTheDocument()
  })

  it('renders empty-options label when there are no categories', async () => {
    useAdminCategoriesMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(<CategoriesPicker value={[]} onChange={vi.fn()} disabled={false} max={2} />)
    await userEvent.click(screen.getByRole('button', { name: /add category/i }))
    expect(screen.getByText(/no categories available/i)).toBeInTheDocument()
  })

  it('renders selected chips using the parent-path label', () => {
    useAdminCategoriesMock.mockReturnValue({
      data: [CATEGORY_FOOD, CATEGORY_DESSERTS, CATEGORY_FASHION],
      isLoading: false,
      isError: false,
    })
    render(
      <CategoriesPicker
        value={[CATEGORY_DESSERTS.id]}
        onChange={vi.fn()}
        disabled={false}
        max={2}
      />,
    )
    expect(screen.getByText('Food / Desserts')).toBeInTheDocument()
  })

  it('calls onChange when the user clicks the chip remove button', async () => {
    useAdminCategoriesMock.mockReturnValue({
      data: [CATEGORY_FOOD, CATEGORY_FASHION],
      isLoading: false,
      isError: false,
    })
    const onChange = vi.fn()
    render(
      <CategoriesPicker
        value={[CATEGORY_FOOD.id, CATEGORY_FASHION.id]}
        onChange={onChange}
        disabled={false}
        max={2}
      />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: /remove category food/i }),
    )
    expect(onChange).toHaveBeenCalledWith([CATEGORY_FASHION.id])
  })

  it('disables unselected options when the max is reached', async () => {
    useAdminCategoriesMock.mockReturnValue({
      data: [CATEGORY_FOOD, CATEGORY_DESSERTS, CATEGORY_FASHION],
      isLoading: false,
      isError: false,
    })
    const onChange = vi.fn()
    render(
      <CategoriesPicker
        value={[CATEGORY_FOOD.id, CATEGORY_DESSERTS.id]}
        onChange={onChange}
        disabled={false}
        max={2}
      />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: /at most 2 categories/i }),
    )
    const option = await screen.findByRole('menuitemcheckbox', { name: 'Fashion' })
    expect(option).toHaveAttribute('aria-disabled', 'true')
  })

  it('appends a selection when the user picks an unselected option', async () => {
    useAdminCategoriesMock.mockReturnValue({
      data: [CATEGORY_FOOD, CATEGORY_FASHION],
      isLoading: false,
      isError: false,
    })
    const onChange = vi.fn()
    render(
      <CategoriesPicker value={[]} onChange={onChange} disabled={false} max={2} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /add category/i }))
    const option = await screen.findByRole('menuitemcheckbox', { name: 'Food' })
    await userEvent.click(option)
    expect(onChange).toHaveBeenCalledWith([CATEGORY_FOOD.id])
  })
})
