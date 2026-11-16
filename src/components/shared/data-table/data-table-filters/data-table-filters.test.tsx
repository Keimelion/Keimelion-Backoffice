import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '@/test/test-utils'

const replaceMock = vi.fn()
const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

import { DataTableFilters } from './data-table-filters'
import type { FilterDefinition } from './data-table-filters'

const TEXT_ONLY_FILTERS: FilterDefinition[] = [
  {
    type: 'text',
    paramName: 'email',
    label: 'Email',
    placeholder: 'Filter by email…',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DataTableFilters', () => {
  it('renders text filter input', () => {
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('debounces text input and calls router.replace after 300ms', () => {
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    const input = screen.getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'a' } })
    expect(replaceMock).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(replaceMock).toHaveBeenCalledOnce()
    const calledUrl = replaceMock.mock.calls[0]?.[0] as string
    expect(calledUrl).toContain('email=a')
  })

  it('does not call router.replace before debounce fires', () => {
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    const input = screen.getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'test' } })
    vi.advanceTimersByTime(100)
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('resets page param when text filter changes', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('page=3'))
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    const input = screen.getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'x' } })
    vi.advanceTimersByTime(300)
    const calledUrl = replaceMock.mock.calls[0]?.[0] as string
    expect(calledUrl).not.toContain('page=')
  })
})

const STATUS_FILTER: FilterDefinition[] = [
  {
    type: 'multi-select',
    paramName: 'status',
    label: 'Status',
    placeholder: 'All statuses',
    options: [
      { value: 'open', label: 'Open', content: <span data-testid="badge-open">Open</span> },
      { value: 'reviewed', label: 'Reviewed' },
      { value: 'closed', label: 'Closed', content: <span data-testid="badge-closed">Closed</span> },
    ],
  },
]

function renderStatusFilter(): void {
  renderWithIntl(<DataTableFilters filters={STATUS_FILTER} />)
}

describe('DataTableFilters multi-select', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('shows the placeholder when nothing is selected', () => {
    renderStatusFilter()
    expect(screen.getByLabelText('Status')).toHaveTextContent('All statuses')
  })

  it('renders option content when provided and falls back to the plain label', async () => {
    renderStatusFilter()
    await userEvent.click(screen.getByLabelText('Status'))
    const openOption = await screen.findByRole('menuitemcheckbox', { name: 'Open' })
    expect(within(openOption).getByTestId('badge-open')).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Reviewed' })).toHaveTextContent('Reviewed')
  })

  it('shows the single selected option content in the trigger', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=closed'))
    renderStatusFilter()
    const trigger = screen.getByLabelText('Status')
    expect(within(trigger).getByTestId('badge-closed')).toBeInTheDocument()
    expect(trigger).not.toHaveTextContent('+')
  })

  it('shows the first selected option plus a +N counter for the others', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=closed,reviewed,open'))
    renderStatusFilter()
    const trigger = screen.getByLabelText('Status')
    expect(within(trigger).getByTestId('badge-open')).toBeInTheDocument()
    expect(within(trigger).queryByTestId('badge-closed')).not.toBeInTheDocument()
    expect(trigger).toHaveTextContent('+2')
    expect(trigger).toHaveAttribute('title', 'Open, Reviewed, Closed')
  })

  it('checks the selected options in the menu', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=closed,open'))
    renderStatusFilter()
    await userEvent.click(screen.getByLabelText('Status'))
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Open' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'Reviewed' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('writes the selection in option order, comma-separated, and resets the page', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=closed&page=2'))
    renderStatusFilter()
    await userEvent.click(screen.getByLabelText('Status'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Open' }))
    expect(replaceMock).toHaveBeenLastCalledWith('?status=open%2Cclosed', { scroll: false })
  })

  it('removes the param when the last option is unchecked', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=open'))
    renderStatusFilter()
    await userEvent.click(screen.getByLabelText('Status'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Open' }))
    expect(replaceMock).toHaveBeenLastCalledWith('?', { scroll: false })
  })
})
