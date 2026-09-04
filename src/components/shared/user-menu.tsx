'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu(): React.JSX.Element {
  const { data: currentUser } = useCurrentUser()

  if (!currentUser) return <></>

  const displayName = currentUser.username ?? currentUser.email
  const initials = getInitials(displayName)

  return (
    <div className="flex items-center gap-3">
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
    </div>
  )
}
