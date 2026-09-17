import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { renderWithIntl } from '@/test/test-utils'
import { DataTable } from './data-table'
import type { DataTableColumn } from './data-table'

const replaceMock = vi.fn()
const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

interface FixtureRow {
  id: string
  name: string
}

const COLUMNS: DataTableColumn<FixtureRow>[] = [
  { key: 'id', header: 'ID', cell: (row) => row.id },
  { key: 'name', header: 'Name', cell: (row) => row.name },
]

const SORTABLE_COLUMNS: DataTableColumn<FixtureRow>[] = [
  { key: 'id', header: 'ID', cell: (row) => row.id },
  { key: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
]

const DATA: FixtureRow[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
]

const SKELETON_ROW_COUNT = 5
const EMPTY_LABEL = 'No items found.'

function renderTable(overrides: Partial<Parameters<typeof DataTable<FixtureRow>>[0]> = {}): void {
  renderWithIntl(
    <DataTable
      columns={COLUMNS}
      data={DATA}
      isLoading={false}
      error={null}
      emptyLabel={EMPTY_LABEL}
      skeletonRowCount={SKELETON_ROW_COUNT}
      onRetry={vi.fn()}
      {...overrides}
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

describe('DataTable', () => {
  it('renders column headers', () => {
    renderTable()
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    renderTable()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders skeleton rows equal to skeletonRowCount when isLoading', () => {
    renderTable({ data: [], isLoading: true })
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(SKELETON_ROW_COUNT * COLUMNS.length)
  })

  it('renders empty state label when data is empty and not loading', () => {
    renderTable({ data: [] })
    expect(screen.getByText(EMPTY_LABEL)).toBeInTheDocument()
  })

  it('renders error message when error is set', () => {
    renderTable({ data: [], error: new Error('Server error') })
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('calls onRetry when Retry button is clicked', async () => {
    const onRetry = vi.fn()
    renderTable({ data: [], error: new Error('Server error'), onRetry })
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('does not render table body rows when error is set', () => {
    renderTable({ data: [], error: new Error('fail') })
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  describe('sortable columns', () => {
    it('renders a sortable header as a button', () => {
      renderWithIntl(
        <DataTable
          columns={SORTABLE_COLUMNS}
          data={DATA}
          isLoading={false}
          error={null}
          emptyLabel={EMPTY_LABEL}
          skeletonRowCount={SKELETON_ROW_COUNT}
          onRetry={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: /sort by name/i })).toBeInTheDocument()
    })

    it('renders a non-sortable header as plain text without a button', () => {
      renderWithIntl(
        <DataTable
          columns={SORTABLE_COLUMNS}
          data={DATA}
          isLoading={false}
          error={null}
          emptyLabel={EMPTY_LABEL}
          skeletonRowCount={SKELETON_ROW_COUNT}
          onRetry={vi.fn()}
        />,
      )
      expect(screen.queryByRole('button', { name: /sort by id/i })).not.toBeInTheDocument()
      expect(screen.getByText('ID')).toBeInTheDocument()
    })

    it('writes sort=name:asc to URL when clicking an unsorted sortable header', async () => {
      renderWithIntl(
        <DataTable
          columns={SORTABLE_COLUMNS}
          data={DATA}
          isLoading={false}
          error={null}
          emptyLabel={EMPTY_LABEL}
          skeletonRowCount={SKELETON_ROW_COUNT}
          onRetry={vi.fn()}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /sort by name/i }))
      const calledUrl = replaceMock.mock.calls.at(-1)?.[0] as string
      expect(calledUrl).toContain('sort=name%3Aasc')
    })

    it('toggles to desc after clicking an asc-sorted column', async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=name:asc'))
      renderWithIntl(
        <DataTable
          columns={SORTABLE_COLUMNS}
          data={DATA}
          isLoading={false}
          error={null}
          emptyLabel={EMPTY_LABEL}
          skeletonRowCount={SKELETON_ROW_COUNT}
          onRetry={vi.fn()}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /sort by name/i }))
      const calledUrl = replaceMock.mock.calls.at(-1)?.[0] as string
      expect(calledUrl).toContain('sort=name%3Adesc')
    })

    it('removes sort param after clicking a desc-sorted column', async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=name:desc'))
      renderWithIntl(
        <DataTable
          columns={SORTABLE_COLUMNS}
          data={DATA}
          isLoading={false}
          error={null}
          emptyLabel={EMPTY_LABEL}
          skeletonRowCount={SKELETON_ROW_COUNT}
          onRetry={vi.fn()}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /sort by name/i }))
      const calledUrl = replaceMock.mock.calls.at(-1)?.[0] as string
      expect(calledUrl).not.toContain('sort=')
    })

    it('resets to asc when clicking a different sortable column', async () => {
      const multiSortableColumns: DataTableColumn<FixtureRow>[] = [
        { key: 'id', header: 'ID', cell: (row) => row.id, sortable: true },
        { key: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
      ]
      useSearchParamsMock.mockReturnValue(new URLSearchParams('sort=name:desc'))
      renderWithIntl(
        <DataTable
          columns={multiSortableColumns}
          data={DATA}
          isLoading={false}
          error={null}
          emptyLabel={EMPTY_LABEL}
          skeletonRowCount={SKELETON_ROW_COUNT}
          onRetry={vi.fn()}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /sort by id/i }))
      const calledUrl = replaceMock.mock.calls.at(-1)?.[0] as string
      expect(calledUrl).toContain('sort=id%3Aasc')
    })
  })
})
