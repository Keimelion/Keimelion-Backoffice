import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { ImageThumbnail } from './image-thumbnail'

describe('ImageThumbnail', () => {
  it('renders the image when src is a valid URL', () => {
    renderWithIntl(<ImageThumbnail src="https://cdn.example.com/a.webp" alt="Lamp" />)
    const img = screen.getByAltText('Lamp')
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/a.webp')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('wraps the image in an anchor pointing to fullSrc when provided', () => {
    renderWithIntl(
      <ImageThumbnail
        src="https://cdn.example.com/small.webp"
        fullSrc="https://cdn.example.com/large.webp"
        alt="Lamp"
      />,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://cdn.example.com/large.webp')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('falls back to src for the anchor href when fullSrc is not provided', () => {
    renderWithIntl(<ImageThumbnail src="https://cdn.example.com/a.webp" alt="Lamp" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://cdn.example.com/a.webp')
  })

  it('renders the placeholder when src is null', () => {
    renderWithIntl(<ImageThumbnail src={null} alt="Lamp" />)
    const placeholder = screen.getByRole('img', { name: 'Lamp' })
    expect(placeholder.tagName).toBe('DIV')
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders the placeholder when src is not a valid HTTP(S) URL', () => {
    renderWithIntl(<ImageThumbnail src="javascript:alert(1)" alt="Lamp" />)
    const placeholder = screen.getByRole('img', { name: 'Lamp' })
    expect(placeholder.tagName).toBe('DIV')
  })

  it('switches to the placeholder when the image load errors', () => {
    renderWithIntl(<ImageThumbnail src="https://cdn.example.com/a.webp" alt="Lamp" />)
    const img = screen.getByAltText('Lamp')
    fireEvent.error(img)
    const placeholder = screen.getByRole('img', { name: 'Lamp' })
    expect(placeholder.tagName).toBe('DIV')
  })
})
