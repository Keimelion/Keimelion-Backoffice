import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CurrentUser {
  name: string
  email: string
  avatarUrl: string | null
}

const CURRENT_USER: CurrentUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: null,
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu(): React.JSX.Element {
  const initials = getInitials(CURRENT_USER.name)

  return (
    <div className="flex items-center gap-3">
      <div className="hidden flex-col text-right leading-tight sm:flex">
        <span className="text-sm font-semibold text-foreground">{CURRENT_USER.name}</span>
        <span className="text-xs text-muted-foreground">{CURRENT_USER.email}</span>
      </div>
      <Avatar className="h-10 w-10">
        {CURRENT_USER.avatarUrl ? (
          <AvatarImage src={CURRENT_USER.avatarUrl} alt={CURRENT_USER.name} />
        ) : null}
        <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
