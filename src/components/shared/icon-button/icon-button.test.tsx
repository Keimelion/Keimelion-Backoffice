import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { IconButton } from './icon-button'

describe('IconButton', () => {
  it('renders the icon child', () => {
    render(
      <IconButton label="Delete">
        <svg data-testid="icon" />
      </IconButton>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('exposes the label as aria-label and title', () => {
    render(
      <IconButton label="Delete">
        <svg />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveAttribute('title', 'Delete')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(
      <IconButton label="Update" onClick={onClick}>
        <svg />
      </IconButton>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies destructive tone classes when tone is destructive', () => {
    render(
      <IconButton label="Delete" tone="destructive">
        <svg />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('text-rose-600/80')
  })
})
