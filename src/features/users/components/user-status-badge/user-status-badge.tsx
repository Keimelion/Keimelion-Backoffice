import { Badge } from '@/components/ui/badge'

interface UserStatusBadgeProps {
  deletedAt: string | null
  bannedAt: string | null
}

const ACTIVE_CLASSES = 'border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80'
const DELETED_CLASSES = 'border-transparent bg-slate-400 text-white hover:bg-slate-400/80'
const BANNED_CLASSES = 'border-transparent bg-red-500 text-white hover:bg-red-500/80'

export function UserStatusBadge({ deletedAt, bannedAt }: UserStatusBadgeProps): React.JSX.Element {
  if (deletedAt !== null) {
    return <Badge className={DELETED_CLASSES}>Deleted</Badge>
  }
  if (bannedAt !== null) {
    return <Badge className={BANNED_CLASSES}>Banned</Badge>
  }
  return <Badge className={ACTIVE_CLASSES}>Active</Badge>
}
