import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { IconButton } from './icon-button'

function renderWithTooltip(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

describe('IconButton', () => {
  it('renders the icon child', () => {
    renderWithTooltip(
      <IconButton label="Delete">
        <svg data-testid="icon" />
      </IconButton>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('exposes the label as aria-label and preserves the sr-only span', () => {
    renderWithTooltip(
      <IconButton label="Delete">
        <svg />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveAttribute('aria-label', 'Delete')
    expect(button.querySelector('.sr-only')).toHaveTextContent('Delete')
  })

  it('does not have a title attribute', () => {
    renderWithTooltip(
      <IconButton label="Delete">
        <svg />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).not.toHaveAttribute('title')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    renderWithTooltip(
      <IconButton label="Update" onClick={onClick}>
        <svg />
      </IconButton>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies destructive tone classes when tone is destructive', () => {
    renderWithTooltip(
      <IconButton label="Delete" tone="destructive">
        <svg />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('text-rose-600/80')
  })

  it('shows tooltip content on hover', async () => {
    renderWithTooltip(
      <IconButton label="Edit user">
        <svg />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Edit user' })
    await userEvent.hover(button)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Edit user')
  })

  it('shows tooltip content on keyboard focus', async () => {
    renderWithTooltip(
      <IconButton label="Delete user">
        <svg />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Delete user' })
    button.focus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Delete user')
  })
})
