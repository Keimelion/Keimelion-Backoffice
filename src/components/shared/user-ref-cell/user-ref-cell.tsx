'use client'

import Link from 'next/link'

interface UserRefCellProps {
  user: {
    id: string
    email: string
    username: string | null
  } | null
  fallback: string
}

export function UserRefCell({ user, fallback }: UserRefCellProps): React.JSX.Element {
  if (user === null) {
    return <span className="text-sm text-muted-foreground">{fallback}</span>
  }
  return (
    <div className="flex flex-col gap-0.5">
      <Link
        href={`/users?id=${user.id}`}
        className="text-sm font-medium hover:underline"
      >
        {user.username ?? user.email}
      </Link>
      <span className="font-mono text-[10px] text-muted-foreground">{user.id}</span>
    </div>
  )
}
