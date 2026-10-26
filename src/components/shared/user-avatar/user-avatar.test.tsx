import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { UserAvatar } from './user-avatar'

describe('UserAvatar', () => {
  it('renders the image when src is a valid URL', () => {
    renderWithIntl(<UserAvatar src="https://cdn.example.com/me.webp" name="Alice" />)
    const img = screen.getByAltText('Alice')
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/me.webp')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('renders the initial fallback when src is null', () => {
    renderWithIntl(<UserAvatar src={null} name="Alice" />)
    const avatar = screen.getByRole('img', { name: 'Alice' })
    expect(avatar.tagName).toBe('DIV')
    expect(avatar).toHaveTextContent('A')
  })

  it('renders the initial fallback when src is not a valid HTTP(S) URL', () => {
    renderWithIntl(<UserAvatar src="javascript:alert(1)" name="Alice" />)
    const avatar = screen.getByRole('img', { name: 'Alice' })
    expect(avatar.tagName).toBe('DIV')
  })

  it('switches to the initial fallback when the image load errors', () => {
    renderWithIntl(<UserAvatar src="https://cdn.example.com/me.webp" name="Alice" />)
    const img = screen.getByAltText('Alice')
    fireEvent.error(img)
    const avatar = screen.getByRole('img', { name: 'Alice' })
    expect(avatar.tagName).toBe('DIV')
    expect(avatar).toHaveTextContent('A')
  })

  it('uppercases the initial even when the name starts lowercase', () => {
    renderWithIntl(<UserAvatar src={null} name="bob@example.com" />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders a fallback character when the name is only whitespace', () => {
    renderWithIntl(<UserAvatar src={null} name="   " />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
