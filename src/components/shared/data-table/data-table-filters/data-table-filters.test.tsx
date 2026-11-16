import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import userEvent from '@testing-library/user-event'

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
      { value: 'open', label: 'Open' },
      { value: 'reviewed', label: 'Reviewed' },
      { value: 'closed', label: 'Closed' },
    ],
  },
]

describe('DataTableFilters multi-select', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('shows the placeholder when nothing is selected', () => {
    render(<DataTableFilters filters={STATUS_FILTER} />)
    expect(screen.getByLabelText('Status')).toHaveTextContent('All statuses')
  })

  it('lists the selected option labels and checks them in the menu', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=closed,open'))
    render(<DataTableFilters filters={STATUS_FILTER} />)
    expect(screen.getByLabelText('Status')).toHaveTextContent('Open, Closed')
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
    render(<DataTableFilters filters={STATUS_FILTER} />)
    await userEvent.click(screen.getByLabelText('Status'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Open' }))
    expect(replaceMock).toHaveBeenLastCalledWith('?status=open%2Cclosed', { scroll: false })
  })

  it('removes the param when the last option is unchecked', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('status=open'))
    render(<DataTableFilters filters={STATUS_FILTER} />)
    await userEvent.click(screen.getByLabelText('Status'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Open' }))
    expect(replaceMock).toHaveBeenLastCalledWith('?', { scroll: false })
  })
})
