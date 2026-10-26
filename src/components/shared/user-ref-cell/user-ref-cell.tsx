'use client'

import Link from 'next/link'

interface UserRefCellProps {
  user: {
    id: string
    email: string
    username: string | null
  } | null
  fallback?: string
}

export function UserRefCell({ user, fallback = '' }: UserRefCellProps): React.JSX.Element {
  if (user === null) {
    return <span className="text-sm text-muted-foreground">{fallback}</span>
  }
  return (
    <Link
      href={`/users?id=${user.id}`}
      className="group flex flex-col gap-0.5"
    >
      <span className="text-sm font-medium group-hover:underline">
        {user.username ?? user.email}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground group-hover:underline">
        {user.id}
      </span>
    </Link>
  )
}
