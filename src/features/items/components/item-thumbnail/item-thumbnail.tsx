'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslate } from '@/lib/i18n/use-translate'
import { isHttpsUrl } from '@/lib/url'

interface ItemThumbnailProps {
  imageUrl: string | null
  name: string
  className?: string
}

export function ItemThumbnail({ imageUrl, name, className }: ItemThumbnailProps): React.JSX.Element {
  const t = useTranslate()
  const [hasErrored, setHasErrored] = useState<boolean>(false)
  const isSafeImage = isHttpsUrl(imageUrl)

  if (!isSafeImage || hasErrored) {
    return (
      <div
        role="img"
        aria-label={t('items.table.image_fallback_alt')}
        className={cn('flex items-center justify-center rounded-md bg-muted text-muted-foreground', className)}
      >
        <ImageOff className="h-4 w-4" />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      loading="lazy"
      onError={() => { setHasErrored(true) }}
      className={cn('rounded-md object-cover', className)}
    />
  )
}
