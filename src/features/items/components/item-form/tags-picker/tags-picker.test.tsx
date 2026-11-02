import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { TagsPicker } from './tags-picker'

const TAG_PREMIUM = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'premium',
  slug: 'premium',
}
const TAG_EXCLUSIVE = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'exclusive',
  slug: 'exclusive',
}

interface MockPaginatedTagsData {
  items: unknown
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface MockQueryResult {
  data: MockPaginatedTagsData | undefined
  isLoading: boolean
  isError: boolean
}

const useAdminTagsMock = vi.fn<() => MockQueryResult>()

vi.mock('@/features/tags/hooks/use-admin-tags', () => ({
  useAdminTags: (): MockQueryResult => useAdminTagsMock(),
}))

function toPaginated(items: unknown[]): MockPaginatedTagsData {
  return {
    items,
    pagination: { page: 1, limit: 100, total: items.length, totalPages: 1 },
  }
}

function render(ui: ReactElement): void {
  renderWithQueryClient(ui)
}

const DEFAULT_PROPS = { disabled: false, max: 20, maxNameLength: 50 }

describe('TagsPicker', () => {
  it('shows a skeleton while tags are loading', () => {
    useAdminTagsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    render(<TagsPicker value={[]} onChange={vi.fn()} {...DEFAULT_PROPS} />)
    expect(screen.getByText(/loading tags/i)).toBeInTheDocument()
  })

  it('shows an error state when the tags query fails', () => {
    useAdminTagsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    render(<TagsPicker value={[]} onChange={vi.fn()} {...DEFAULT_PROPS} />)
    expect(screen.getByText(/failed to load tags/i)).toBeInTheDocument()
  })

  it('shows the empty-options hint when there are no existing tags and no search', async () => {
    useAdminTagsMock.mockReturnValue({ data: toPaginated([]), isLoading: false, isError: false })
    render(<TagsPicker value={[]} onChange={vi.fn()} {...DEFAULT_PROPS} />)
    await userEvent.click(screen.getByRole('button', { name: /add tag/i }))
    expect(screen.getByText(/type a name to create one/i)).toBeInTheDocument()
  })

  it('renders a chip per selected tag name', () => {
    useAdminTagsMock.mockReturnValue({ data: toPaginated([]), isLoading: false, isError: false })
    render(
      <TagsPicker value={['gaming', 'board-game']} onChange={vi.fn()} {...DEFAULT_PROPS} />,
    )
    expect(screen.getByText('gaming')).toBeInTheDocument()
    expect(screen.getByText('board-game')).toBeInTheDocument()
  })

  it('calls onChange when the user clicks a chip remove button', async () => {
    useAdminTagsMock.mockReturnValue({ data: toPaginated([]), isLoading: false, isError: false })
    const onChange = vi.fn()
    render(
      <TagsPicker value={['gaming', 'premium']} onChange={onChange} {...DEFAULT_PROPS} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /remove tag gaming/i }))
    expect(onChange).toHaveBeenCalledWith(['premium'])
  })

  it('appends an existing tag when the user picks it from the list', async () => {
    useAdminTagsMock.mockReturnValue({
      data: toPaginated([TAG_PREMIUM, TAG_EXCLUSIVE]),
      isLoading: false,
      isError: false,
    })
    const onChange = vi.fn()
    render(<TagsPicker value={[]} onChange={onChange} {...DEFAULT_PROPS} />)
    await userEvent.click(screen.getByRole('button', { name: /add tag/i }))
    const option = await screen.findByRole('option', { name: /^premium$/i })
    await userEvent.click(option)
    expect(onChange).toHaveBeenCalledWith(['premium'])
  })

  it('creates a new tag from the typed search text', async () => {
    useAdminTagsMock.mockReturnValue({ data: toPaginated([]), isLoading: false, isError: false })
    const onChange = vi.fn()
    render(<TagsPicker value={[]} onChange={onChange} {...DEFAULT_PROPS} />)
    await userEvent.click(screen.getByRole('button', { name: /add tag/i }))
    await userEvent.type(screen.getByPlaceholderText(/search or create a tag/i), 'brand-new')
    const createOption = await screen.findByRole('option', { name: /create "brand-new"/i })
    await userEvent.click(createOption)
    expect(onChange).toHaveBeenCalledWith(['brand-new'])
  })

  it('hides the create option when the search matches a tag already selected', async () => {
    useAdminTagsMock.mockReturnValue({ data: toPaginated([]), isLoading: false, isError: false })
    render(<TagsPicker value={['premium']} onChange={vi.fn()} {...DEFAULT_PROPS} />)
    await userEvent.click(screen.getByRole('button', { name: /add tag/i }))
    await userEvent.type(screen.getByPlaceholderText(/search or create a tag/i), 'premium')
    expect(screen.queryByRole('option', { name: /create "premium"/i })).not.toBeInTheDocument()
  })

  it('hides the add button when the max is reached', () => {
    useAdminTagsMock.mockReturnValue({ data: toPaginated([]), isLoading: false, isError: false })
    render(
      <TagsPicker
        value={['a', 'b']}
        onChange={vi.fn()}
        disabled={false}
        max={2}
        maxNameLength={50}
      />,
    )
    expect(screen.queryByRole('button', { name: /add tag/i })).not.toBeInTheDocument()
  })

  it('excludes already-selected existing tags from the available options list', async () => {
    useAdminTagsMock.mockReturnValue({
      data: toPaginated([TAG_PREMIUM, TAG_EXCLUSIVE]),
      isLoading: false,
      isError: false,
    })
    render(<TagsPicker value={['premium']} onChange={vi.fn()} {...DEFAULT_PROPS} />)
    await userEvent.click(screen.getByRole('button', { name: /add tag/i }))
    expect(screen.queryByRole('option', { name: /^premium$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: /^exclusive$/i })).toBeInTheDocument()
  })
})
