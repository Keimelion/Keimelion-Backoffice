import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { OccasionTypePicker } from './occasion-type-picker'

function render(ui: ReactElement): void {
  renderWithQueryClient(ui)
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/occasion-types/hooks/use-occasion-types', () => ({
  useOccasionTypes: vi.fn(),
}))

import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'

const BIRTHDAY_ID = '55555555-5555-4555-8555-555555555555'
const WEDDING_ID = '66666666-6666-4666-8666-666666666666'
const NO_EMOJI_ID = '77777777-7777-4777-8777-777777777777'

type UseOccasionTypesReturn = ReturnType<typeof useOccasionTypes>

function mockOccasionTypes(): void {
  vi.mocked(useOccasionTypes).mockReturnValue({
    data: [
      { id: BIRTHDAY_ID, slug: 'birthday', label: 'Birthday', emoji: '🎂' },
      { id: WEDDING_ID, slug: 'wedding', label: 'Wedding', emoji: '💍' },
      { id: NO_EMOJI_ID, slug: 'other', label: 'Other', emoji: null },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as UseOccasionTypesReturn)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockOccasionTypes()
})

describe('OccasionTypePicker', () => {
  it('shows the placeholder when no occasion is selected', () => {
    render(<OccasionTypePicker value={null} onChange={vi.fn()} disabled={false} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Select an occasion')
  })

  it('shows the selected occasion label and emoji in the trigger', () => {
    render(<OccasionTypePicker value={BIRTHDAY_ID} onChange={vi.fn()} disabled={false} />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Birthday')
    expect(trigger).toHaveTextContent('🎂')
  })

  it('opens the popover and lists all occasions with their emojis', async () => {
    render(<OccasionTypePicker value={null} onChange={vi.fn()} disabled={false} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('Birthday')).toBeInTheDocument()
    expect(screen.getByText('Wedding')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
    expect(screen.getByText('🎂')).toBeInTheDocument()
    expect(screen.getByText('💍')).toBeInTheDocument()
  })

  it('calls onChange with the selected id when picking an occasion', async () => {
    const onChange = vi.fn()
    render(<OccasionTypePicker value={null} onChange={onChange} disabled={false} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Wedding'))
    expect(onChange).toHaveBeenCalledWith(WEDDING_ID)
  })

  it('calls onChange with null when picking the "no occasion" option', async () => {
    const onChange = vi.fn()
    render(<OccasionTypePicker value={BIRTHDAY_ID} onChange={onChange} disabled={false} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('No occasion'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('is disabled when the disabled prop is true', () => {
    render(<OccasionTypePicker value={null} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('shows a loading skeleton while the query is pending', () => {
    vi.mocked(useOccasionTypes).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseOccasionTypesReturn)
    const { container } = { container: document.body }
    render(<OccasionTypePicker value={null} onChange={vi.fn()} disabled={false} />)
    expect(container.querySelector('.animate-pulse')).not.toBeNull()
  })
})
