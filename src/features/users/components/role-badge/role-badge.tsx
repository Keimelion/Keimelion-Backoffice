import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { UserRoles } from '@keimelion/api/shared/enums/user-role'

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps): React.JSX.Element {
  switch (role) {
    case UserRoles.ADMIN:
      return <Badge variant="destructive">Admin</Badge>
    case UserRoles.MODERATOR:
      return <Badge variant="secondary">Moderator</Badge>
    case UserRoles.USER:
      return <Badge variant="outline">User</Badge>
    default: {
      const exhaustiveCheck: never = role
      return <Badge variant="outline">{String(exhaustiveCheck)}</Badge>
    }
  }
}
