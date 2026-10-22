'use client'

import Link from 'next/link'
import { LogOut, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { useTranslate } from '@/lib/i18n/use-translate'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu(): React.JSX.Element {
  const currentUser = useCurrentUser()
  const logout = useLogout()
  const t = useTranslate()

  if (!currentUser) return <></>

  const displayName = currentUser.username ?? currentUser.email
  const initials = getInitials(displayName)

  const handleSignOut = (): void => {
    logout.mutate(null)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('common.user_menu.open')}
        className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="hidden flex-col text-right leading-tight sm:flex">
          <span className="text-sm font-semibold text-foreground">{displayName}</span>
          <span className="text-xs text-muted-foreground">{currentUser.email}</span>
        </div>
        <Avatar className="h-10 w-10">
          {currentUser.avatarUrl ? (
            <AvatarImage src={currentUser.avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{displayName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {currentUser.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserCircle className="h-4 w-4" />
            {t('common.nav.profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSignOut}
          disabled={logout.isPending}
          className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t('common.actions.sign_out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
