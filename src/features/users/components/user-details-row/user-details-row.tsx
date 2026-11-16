'use client'

import type { ReactNode } from 'react'
import { UserStatuses } from '@keimelion/sdk/enums'
import type { AdminUserDetailParsed } from '@keimelion/sdk/schemas'
import { ResendInvitationButton } from '@/features/users/components/resend-invitation-button'
import { UserStatusBadge } from '@/features/users/components/user-status-badge'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'

const EMPTY_VALUE = '—'

interface UserDetailsRowProps {
  user: AdminUserDetailParsed
  canManageUsers: boolean
}

export function UserDetailsRow({ user, canManageUsers }: UserDetailsRowProps): React.JSX.Element {
  const t = useTranslate()
  const canResendInvitation = canManageUsers && user.status === UserStatuses.INVITED

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-background p-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
        <DetailItem label={t('users.details.status')}>
          <UserStatusBadge status={user.status} />
        </DetailItem>
        <DetailItem label={t('users.details.activated_at')}>
          {formatOptionalDate(user.activatedAt)}
        </DetailItem>
        <DetailItem label={t('users.details.email_verified_at')}>
          {formatOptionalDate(user.emailVerifiedAt)}
        </DetailItem>
        <DetailItem label={t('users.details.banned_at')}>
          {formatOptionalDate(user.bannedAt)}
        </DetailItem>
      </dl>
      {canResendInvitation ? (
        <div className="flex justify-end">
          <ResendInvitationButton user={user} />
        </div>
      ) : null}
    </div>
  )
}

function formatOptionalDate(date: Date | null): string {
  return date === null ? EMPTY_VALUE : formatDate(date)
}

interface DetailItemProps {
  label: string
  children: ReactNode
}

function DetailItem({ label, children }: DetailItemProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  )
}
