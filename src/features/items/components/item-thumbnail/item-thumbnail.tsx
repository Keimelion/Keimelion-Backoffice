import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const HTTPS_PREFIX = 'https://'

interface ItemThumbnailProps {
  imageUrl: string | null
  alt: string
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<ItemThumbnailProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
}

function isSafeImageUrl(value: string | null): value is string {
  return typeof value === 'string' && value.startsWith(HTTPS_PREFIX)
}

export function ItemThumbnail({
  imageUrl,
  alt,
  size = 'sm',
  className,
}: ItemThumbnailProps): React.JSX.Element {
  const sizeClass = SIZE_CLASSES[size]
  const safeImageUrl = isSafeImageUrl(imageUrl) ? imageUrl : null

  if (safeImageUrl === null) {
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

  return (
    <img
      src={safeImageUrl}
      alt={alt}
      className={cn('rounded-md border border-border object-cover', sizeClass, className)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  )
}
