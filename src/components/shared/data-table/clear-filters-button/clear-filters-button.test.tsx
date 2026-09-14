import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderWithIntl } from '@/test/query-test-utils'

const replaceMock = vi.fn()
const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

import { ClearFiltersButton } from './clear-filters-button'

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

describe('ClearFiltersButton', () => {
  it('renders nothing when none of the params are active', () => {
    renderWithIntl(<ClearFiltersButton paramNames={['email', 'role']} />)
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('renders when at least one owned param is active', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('role=admin'))
    renderWithIntl(<ClearFiltersButton paramNames={['email', 'role']} />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clears all owned params and the page param on click', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo&role=admin&page=3'))
    renderWithIntl(<ClearFiltersButton paramNames={['email', 'role']} />)
    await userEvent.click(screen.getByRole('button', { name: /clear/i }))
    const calledUrl = replaceMock.mock.calls[0]?.[0] as string
    expect(calledUrl).not.toContain('email=')
    expect(calledUrl).not.toContain('role=')
    expect(calledUrl).not.toContain('page=')
  })

  it('does not touch params outside its owned list', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('email=foo&sort=createdAt:desc'))
    renderWithIntl(<ClearFiltersButton paramNames={['email']} />)
    await userEvent.click(screen.getByRole('button', { name: /clear/i }))
    const calledUrl = replaceMock.mock.calls[0]?.[0] as string
    expect(calledUrl).toContain('sort=')
    expect(calledUrl).not.toContain('email=')
  })
})
