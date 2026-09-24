import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { ItemThumbnail } from './item-thumbnail'

function renderThumbnail(imageUrl: string | null): void {
  renderWithIntl(<ItemThumbnail imageUrl={imageUrl} name="Sample" />)
}

describe('ItemThumbnail', () => {
  it('renders the fallback when imageUrl is null', () => {
    renderThumbnail(null)
    expect(screen.getByRole('img', { name: /image/i })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Sample' })).not.toBeInTheDocument()
  })

  it('renders an img tag for an https URL', () => {
    renderThumbnail('https://example.com/cdn/img.png')
    const image = screen.getByRole('img', { name: 'Sample' })
    expect(image.tagName).toBe('IMG')
    expect(image).toHaveAttribute('src', 'https://example.com/cdn/img.png')
  })

  it('renders the fallback for a non-https URL to prevent unsafe embeds', () => {
    renderThumbnail('data:image/svg+xml,<svg onload=alert(1)/>')
    expect(screen.queryByRole('img', { name: 'Sample' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /image/i })).toBeInTheDocument()
  })

  it('renders the fallback for an http URL', () => {
    renderThumbnail('http://example.com/img.png')
    expect(screen.queryByRole('img', { name: 'Sample' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /image/i })).toBeInTheDocument()
  })
})
