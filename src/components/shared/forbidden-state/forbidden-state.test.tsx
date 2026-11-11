import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { ForbiddenState } from './forbidden-state'

describe('ForbiddenState', () => {
  it('renders the title and description of the given namespace', () => {
    renderWithIntl(<ForbiddenState namespace="reports.forbidden" />)
    expect(screen.getByText('Access restricted')).toBeInTheDocument()
    expect(screen.getByText('You need admin privileges to review reports.')).toBeInTheDocument()
  })
})
