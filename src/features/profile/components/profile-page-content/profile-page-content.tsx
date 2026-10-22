'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChangePasswordForm } from '@/features/profile/components/change-password-form'
import { DefaultCurrencyForm } from '@/features/profile/components/default-currency-form'
import { PersonalInfoForm } from '@/features/profile/components/personal-info-form'
import { useProfile } from '@/features/profile/hooks/use-profile'
import { useTranslate } from '@/lib/i18n/use-translate'

export function ProfilePageContent(): React.JSX.Element {
  const t = useTranslate()
  const { data: user, isError, isPending, refetch } = useProfile()

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{t('query.error.default')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refetch()
          }}
        >
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PersonalInfoForm user={user} />
      <ChangePasswordForm />
      <DefaultCurrencyForm user={user} />
    </div>
  )
}
