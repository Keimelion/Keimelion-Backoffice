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

})
