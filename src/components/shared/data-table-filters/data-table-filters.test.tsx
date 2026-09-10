import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'

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

  it('does not show Clear filters button when no filters are active', () => {
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
  })

  it('shows Clear filters button when a filter param is active', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo'))
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument()
  })

  it('calls router.replace without filter params when Clear filters is clicked', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo&page=2'))
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    const calledUrl = replaceMock.mock.calls[0]?.[0] as string
    expect(calledUrl).not.toContain('email=')
    expect(calledUrl).not.toContain('page=')
  })

  it('does not remove non-owned params when clearing', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo&sort=createdAt:desc'))
    render(<DataTableFilters filters={TEXT_ONLY_FILTERS} />)
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    const calledUrl = replaceMock.mock.calls[0]?.[0] as string
    expect(calledUrl).toContain('sort=')
    expect(calledUrl).not.toContain('email=')
  })
})
