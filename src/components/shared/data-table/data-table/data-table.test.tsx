import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderWithIntl } from '@/test/test-utils'
import { DataTable } from './data-table'
import type { DataTableColumn } from './data-table'

interface FixtureRow {
  id: string
  name: string
}

const COLUMNS: DataTableColumn<FixtureRow>[] = [
  { key: 'id', header: 'ID', cell: (row) => row.id },
  { key: 'name', header: 'Name', cell: (row) => row.name },
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
})
