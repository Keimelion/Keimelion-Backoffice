'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp'
const PREVIEW_SIZE_PX = 64

interface ImageFileInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'type' | 'onChange'
> {
  value: File | null
  currentImageUrl: string | null
  isCurrentImageCleared: boolean
  previewAlt: string
  removeLabel: string
  onFileChange: (file: File | null) => void
  onClearCurrent: () => void
}

export function ImageFileInput({
  value,
  currentImageUrl,
  isCurrentImageCleared,
  previewAlt,
  removeLabel,
  onFileChange,
  onClearCurrent,
  disabled,
  ...inputProps
}: ImageFileInputProps): React.JSX.Element {
  const [inputKey, setInputKey] = useState<number>(0)
  const [previousValue, setPreviousValue] = useState<File | null>(value)
  const selectedPreviewUrl = useObjectUrl(value)
  const visibleCurrentImage = isCurrentImageCleared ? null : currentImageUrl
  const previewUrl = selectedPreviewUrl ?? visibleCurrentImage

  if (value !== previousValue) {
    setPreviousValue(value)
    if (value === null) setInputKey((key) => key + 1)
  }

  function handleRemove(): void {
    if (value !== null) {
      onFileChange(null)
      return
    }
    onClearCurrent()
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        key={inputKey}
        {...inputProps}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        disabled={disabled}
        onChange={(event) => {
          onFileChange(event.target.files?.[0] ?? null)
        }}
      />
      {previewUrl === null ? null : (
        <div className="flex items-center gap-2">
          <Image
            src={previewUrl}
            alt={previewAlt}
            width={PREVIEW_SIZE_PX}
            height={PREVIEW_SIZE_PX}
            className="h-16 w-16 rounded-md border border-border object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            unoptimized
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={handleRemove}
          >
            <X className="mr-1 h-4 w-4" aria-hidden="true" />
            {removeLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

function useObjectUrl(file: File | null): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file === null) {
      setObjectUrl(null)
      return undefined
    }
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return objectUrl
}
