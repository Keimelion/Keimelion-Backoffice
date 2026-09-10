'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type IconButtonTone = 'default' | 'destructive'

interface IconButtonProps {
  label: string
  onClick?: () => void
  tone?: IconButtonTone
  className?: string
  children: ReactNode
}

const BASE_CLASSES =
  'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-all duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0'

const TONE_CLASSES: Record<IconButtonTone, string> = {
  default: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  destructive:
    'text-rose-600/80 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400/90 dark:hover:bg-rose-400/10 dark:hover:text-rose-400',
}

export function IconButton({
  label,
  onClick,
  tone = 'default',
  className,
  children,
}: IconButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(BASE_CLASSES, TONE_CLASSES[tone], className)}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}
