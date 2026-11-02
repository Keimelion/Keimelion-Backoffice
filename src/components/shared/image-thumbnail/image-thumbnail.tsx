'use client'

import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSafeImageUrl } from '@/lib/is-safe-image-url'
import { useTranslate } from '@/lib/i18n/use-translate'

export type ImageThumbnailSize = 'sm' | 'md'

interface ImageThumbnailProps {
  src: string | null
  alt: string
  size?: ImageThumbnailSize
  fullSrc?: string | null
  className?: string
}

const SIZE_CLASSES: Record<ImageThumbnailSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-16 w-16 text-sm',
}

export function ImageThumbnail({
  src,
  alt,
  size = 'sm',
  fullSrc,
  className,
}: ImageThumbnailProps): React.JSX.Element {
  const t = useTranslate()
  const [hasFailed, setHasFailed] = useState<boolean>(false)
  const safeSrc = isSafeImageUrl(src) ? src : null

  useEffect(() => {
    setHasFailed(false)
  }, [safeSrc])

  const sizeClass = SIZE_CLASSES[size]

  if (safeSrc === null || hasFailed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex items-center justify-center rounded-md border border-border bg-muted text-muted-foreground',
          sizeClass,
          className,
        )}
      >
        <Package aria-hidden="true" className="h-1/2 w-1/2" />
      </div>
    )
  }

  const safeFullSrc = isSafeImageUrl(fullSrc ?? null) ? fullSrc : null
  const resolvedFullSrc = safeFullSrc ?? safeSrc

  const image = (
    <img
      src={safeSrc}
      alt={alt}
      className={cn('rounded-md border border-border object-cover', sizeClass, className)}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => { setHasFailed(true) }}
    />
  )

  return (
    <a
      href={resolvedFullSrc}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('common.image.open_full_size', { name: alt })}
      className="inline-flex"
      onClick={(event) => { event.stopPropagation() }}
    >
      {image}
    </a>
  )
}
