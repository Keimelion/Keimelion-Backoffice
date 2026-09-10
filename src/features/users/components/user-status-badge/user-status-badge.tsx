import { Badge } from '@/components/ui/badge'

interface UserStatusBadgeProps {
  deletedAt: string | null
  bannedAt: string | null
}

export function UserStatusBadge({ deletedAt, bannedAt }: UserStatusBadgeProps): React.JSX.Element {
  if (deletedAt !== null) {
    return <Badge variant="outline" className="text-muted-foreground">Deleted</Badge>
  }
  if (bannedAt !== null) {
    return <Badge variant="destructive">Banned</Badge>
  }
  return <Badge variant="secondary" className="text-green-700 dark:text-green-400">Active</Badge>
}
