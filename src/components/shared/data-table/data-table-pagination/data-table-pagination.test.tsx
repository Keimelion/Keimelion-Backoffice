import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderWithIntl } from '@/test/test-utils'

const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}))

import { DataTablePagination } from './data-table-pagination'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DataTablePagination', () => {
  it('displays correct page info', () => {
    renderWithIntl(<DataTablePagination page={2} pageSize={20} total={60} />)
    expect(screen.getByText('Page 2 / 3')).toBeInTheDocument()
  })

  it('navigates to next page on Next click', async () => {
    renderWithIntl(<DataTablePagination page={1} pageSize={20} total={60} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(replaceMock).toHaveBeenCalledWith('?page=2', { scroll: false })
  })

  it('navigates to previous page on Previous click', async () => {
    renderWithIntl(<DataTablePagination page={2} pageSize={20} total={60} />)
    await userEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(replaceMock).toHaveBeenCalledWith('?page=1', { scroll: false })
  })

  it('disables Previous button on first page', () => {
    renderWithIntl(<DataTablePagination page={1} pageSize={20} total={60} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    renderWithIntl(<DataTablePagination page={3} pageSize={20} total={60} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('shows Page 1 / 1 when total is less than pageSize', () => {
    renderWithIntl(<DataTablePagination page={1} pageSize={20} total={5} />)
    expect(screen.getByText('Page 1 / 1')).toBeInTheDocument()
  })

  it('computes pages correctly with exact multiple', () => {
    renderWithIntl(<DataTablePagination page={1} pageSize={10} total={30} />)
    expect(screen.getByText('Page 1 / 3')).toBeInTheDocument()
  })
})
