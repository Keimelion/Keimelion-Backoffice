import { useState } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/test-utils'
import { ImageFileInput } from './image-file-input'

const IMAGE_FILE = new File(['content'], 'image.png', { type: 'image/png' })
const CURRENT_IMAGE_URL = 'https://cdn.example.com/image-md.webp'

function renderInput(overrides: Partial<React.ComponentProps<typeof ImageFileInput>> = {}): void {
  renderWithIntl(
    <ImageFileInput
      aria-label="Image"
      value={null}
      currentImageUrl={null}
      isCurrentImageCleared={false}
      previewAlt="Preview"
      removeLabel="Remove image"
      onFileChange={vi.fn()}
      onClearCurrent={vi.fn()}
      {...overrides}
    />,
  )
}

function ResettableInput(): React.JSX.Element {
  const [value, setValue] = useState<File | null>(IMAGE_FILE)
  return (
    <>
      <ImageFileInput
        aria-label="Image"
        value={value}
        currentImageUrl={null}
        isCurrentImageCleared={false}
        previewAlt="Preview"
        removeLabel="Remove image"
        onFileChange={setValue}
        onClearCurrent={vi.fn()}
      />
      <button
        type="button"
        onClick={() => {
          setValue(null)
        }}
      >
        Reset
      </button>
    </>
  )
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ImageFileInput', () => {
  it('remounts the native input when the parent resets the value', async () => {
    renderWithIntl(<ResettableInput />)
    const inputBeforeReset = screen.getByLabelText('Image')

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByLabelText('Image')).not.toBe(inputBeforeReset)
  })

  it('restricts the picker to the accepted image types', () => {
    renderInput()
    expect(screen.getByLabelText('Image')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp',
    )
  })

  it('reports the selected file', async () => {
    const onFileChange = vi.fn()
    renderInput({ onFileChange })

    await userEvent.upload(screen.getByLabelText('Image'), IMAGE_FILE)

    expect(onFileChange).toHaveBeenCalledWith(IMAGE_FILE)
  })

  it('previews the selected file and removes it', async () => {
    const onFileChange = vi.fn()
    renderInput({ value: IMAGE_FILE, onFileChange })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'blob:preview')
    })
    await userEvent.click(screen.getByRole('button', { name: 'Remove image' }))

    expect(onFileChange).toHaveBeenCalledWith(null)
  })

  it('offers clearing the existing image when no file is selected', async () => {
    const onClearCurrent = vi.fn()
    renderInput({ currentImageUrl: CURRENT_IMAGE_URL, onClearCurrent })

    expect(screen.getByAltText('Preview')).toHaveAttribute('src', CURRENT_IMAGE_URL)
    await userEvent.click(screen.getByRole('button', { name: 'Remove image' }))

    expect(onClearCurrent).toHaveBeenCalledOnce()
  })

  it('hides the existing image once cleared', () => {
    renderInput({ currentImageUrl: CURRENT_IMAGE_URL, isCurrentImageCleared: true })

    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument()
  })
})
