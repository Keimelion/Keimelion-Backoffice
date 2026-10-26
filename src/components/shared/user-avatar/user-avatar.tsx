'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { isSafeImageUrl } from '@/lib/is-safe-image-url'

export type UserAvatarSize = 'sm' | 'md'

interface UserAvatarProps {
  src: string | null
  name: string
  size?: UserAvatarSize
  className?: string
}

const SIZE_CLASSES: Record<UserAvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-16 w-16 text-base',
}

function resolveInitial(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) return '?'
  return Array.from(trimmed)[0]?.toUpperCase() ?? '?'
}

export function UserAvatar({
  src,
  name,
  size = 'sm',
  className,
}: UserAvatarProps): React.JSX.Element {
  const [hasFailed, setHasFailed] = useState<boolean>(false)
  const safeSrc = isSafeImageUrl(src) ? src : null

  useEffect(() => {
    setHasFailed(false)
  }, [safeSrc])

  const sizeClass = SIZE_CLASSES[size]
  const containerClass = cn(
    'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground',
    sizeClass,
    className,
  )

  if (safeSrc === null || hasFailed) {
    return (
      <div role="img" aria-label={name} className={containerClass}>
        <span aria-hidden="true">{resolveInitial(name)}</span>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <img
        src={safeSrc}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => { setHasFailed(true) }}
      />
    </div>
  )
}
